import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha, ESTADOS } from '../../../utils/mockData';
import { usePropuestas } from '../../../context/PropuestasContext';
import { useProgramas } from '../../../context/ProgramasContext';
import PropuestasHeader from '../../../components/Propuestas/PropuestasHeader';
import Tabs from '../../../components/DAF/Generada/Tabs';
import PropuestaResumen from '../../../components/DAF/Generada/PropuestaResumen';
import ProgramasGrillaDAF from '../../../components/DAF/Generada/ProgramasGrillaDAF';
import ProgramasGrillaDAFRevision from '../../../components/DAF/Generada/ProgramasGrillaDAFRevision';
import ConfirmPreConciliarModal from '../../../components/DAF/Generada/ConfirmPreConciliarModal';
import { format, subMonths } from 'date-fns';

const DAFGenerada = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();
  const { propuestas, setPropuestas } = usePropuestas();
  const { programas, setProgramas } = useProgramas();
  const [activeTab, setActiveTab] = useState('mesConciliado');
  const [expanded, setExpanded] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);

  const propuesta = propuestas.find(p => p.id === propuestaId) || {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'generada',
    carteras: [],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  const programasFiltrados = programas.filter(p => propuesta.carteras.includes(p.cartera));

  const handleCancelarChange = (id) => {
    setProgramas(prev => prev.map(p => p.id === id ? { ...p, cancelar: !p.cancelar } : p));
  };
  const handleMontoPropuestoChange = (programaId, identificador, nuevoMonto) => {
    setProgramas(prev => prev.map(p => {
      if (p.id !== programaId) return p;
      return {
        ...p,
        personas: p.personas.map(persona =>
          persona.identificador === identificador
            ? {
                ...persona,
                monto_inicial: persona.monto,
                monto_propuesto: nuevoMonto,
                monto_propuesto_daf: nuevoMonto,
                monto_editado_en_sesion: true,
                monto_editado_por_daf: true,
                monto_editado_por_jp: false
              }
            : persona
        )
      };
    }));
  };

  const handleRevertirMonto = (programaId, identificador) => {
    setProgramas(prev => prev.map(p => {
      if (p.id !== programaId) return p;
      return {
        ...p,
        personas: p.personas.map(persona =>
          persona.identificador === identificador
            ? {
                ...persona,
                monto_propuesto: persona.monto,
                monto_propuesto_daf: persona.monto,
                monto_editado_en_sesion: false,
                monto_editado_por_daf: false
              }
            : persona
        )
      };
    }));
  };

  const toggleExpand = (programaId) => {
    setExpanded(prev => ({ ...prev, [programaId]: !prev[programaId] }));
  };

  const handlePreConciliar = () => {
    setPropuestas(prev =>
      prev.map(p =>
        p.id === propuesta.id
          ? { ...p, estado: ESTADOS.PRE_CONCILIADO, fecha_actualizacion: new Date() }
          : p
      )
    );
    navigate('/main/propuestas', { replace: true });
  };
  const programasNoAperturar = programasFiltrados.filter(p => p.cancelar);


  const mesBase = useMemo(() => {
    console.log("propuesta: " + JSON.stringify(propuesta))
    if (propuesta?.mes_propuesta) return propuesta.mes_propuesta;
    if (propuesta?.fecha_propuesta) return format(new Date(propuesta.fecha_propuesta), 'yyyy-MM');
    return format(new Date(propuesta.fecha_propuesta), 'yyyy-MM');
  }, [propuesta]);
  console.log("mesBase: "  + mesBase)
  // 2) Mes objetivo = mesBase - 1
  const mesObjetivo = useMemo(() => {
    const [y, m] = mesBase.split('-').map(Number);
    return format(subMonths(new Date(y, m - 1, 1), 1), 'yyyy-MM');
  }, [mesBase]);
  const mesDePrograma = useCallback((p) => {
    if (p?.mes_inaguracion) return p.mes_inaguracion;
    if (p?.fecha_inaguracion) return format(new Date(p.fecha_inaguracion), 'yyyy-MM');
    return mesBase;
  }, [mesBase]);

  // 3) Particionar programas según mes objetivo
  const programasMesConciliado = useMemo(() => {
    return programasFiltrados
      .filter(p => mesDePrograma(p) === mesObjetivo)
      .sort((a, b) => {
        const fa = new Date(a.fecha_inaguracion);
        const fb = new Date(b.fecha_inaguracion);
        return fb - fa; // más reciente primero
      });
  }, [programasFiltrados, mesDePrograma, mesObjetivo]);

  const programasResto = useMemo(() => {
    return programasFiltrados
      .filter(p => mesDePrograma(p) < mesObjetivo)
      .sort((a, b) => {
        const fa = new Date(a.fecha_inaguracion);
        const fb = new Date(b.fecha_inaguracion);
        return fb - fa; // más reciente primero
      });
  }, [programasFiltrados, mesDePrograma, mesObjetivo]);

  console.log('programasResto para conciliación:', programasResto);

  return (
    <div className="min-h-screen bg-gray-100">
      <PropuestasHeader onBack={() => navigate('/main/propuestas')} titulo={"Etapa : Generación"} />

      <PropuestaResumen
        propuesta={propuesta}
        formatearFecha={formatearFecha}
        handlePreConciliar={() => setShowConfirm(true)}
      />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'mesConciliado' && (
        <ProgramasGrillaDAF
          programas={programasMesConciliado}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          onToggleCancelar={handleCancelarChange}
          onChangeMonto={handleMontoPropuestoChange}
          onRevertMonto={handleRevertirMonto}
        />
      )}

      {activeTab === 'mesesPasados' && (
        <ProgramasGrillaDAFRevision
          programas={programasResto}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          onToggleCancelar={handleCancelarChange}
          onChangeMonto={handleMontoPropuestoChange}
          onRevertMonto={handleRevertirMonto}
        />
      )}

      {/* Modal de confirmación */}
      <ConfirmPreConciliarModal
        open={showConfirm}
        programasNoAperturar={programasNoAperturar}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => { setShowConfirm(false); handlePreConciliar(); }}
      />

    </div>
  );
};

export default DAFGenerada;
