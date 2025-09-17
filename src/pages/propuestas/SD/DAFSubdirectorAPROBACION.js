import React, { useState, useMemo, useEffect } from 'react';
import { format as formatDate, subMonths } from 'date-fns';
import { es as localeEs } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha } from '../../../utils/mockData';
import { usePropuestas } from '../../../context/PropuestasContext';
import { useProgramas } from '../../../context/ProgramasContext';
import { useRole } from '../../../context/RoleContext';
import PropuestasHeader from '../../../components/Propuestas/PropuestasHeader';
import PropuestaResumen from '../../../components/DAF/PreConciliada/PropuestaResumen';
import Tabs from '../../../components/JP/Tabs';
import SolicitudesAprobacionComercial from '../../../components/SD/SolicitudesAprobacionComercial';
import LoadingModal from '../../../components/common/LoadingModal';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ProgramasGrillaDAFRevision from '../../../components/DAF/PreConciliada/ProgramasGrillaDAFRevision';
import ProgramasGrillaDAF from '../../../components/DAF/PreConciliada/ProgramasGrillaDAF';

const DAFSubdirectorAPROBACION = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();
  const { propuestas } = usePropuestas();
  const { programas, refutarPorJP, setRefutarPorJP, setProgramas } = useProgramas();
  const { currentUser } = useRole();
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedCarteras, setSelectedCarteras] = useState([]);

  const propuesta = propuestas.find(p =>
    String(p.id_propuesta) === String(propuestaId) ||
    String(p.id) === String(propuestaId)
  ) || {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'pre-conciliado',
    carteras: [],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  useEffect(() => {
    if (!propuestaId) {
      return;
    }
    setIsLoading(true);
    const url = `http://127.0.0.1:8000/propuestas/${propuestaId}/programas`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const programasServicio = data.map(p => ({
            ...p,
            id: `programa-${p.nombre}`,
            cancelar: Boolean(p.cancelar)
          }));
          setProgramas(programasServicio);
        } else {
          console.warn('Los datos recibidos no son un array:', data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener programas de la propuesta:', err);
        setIsLoading(false);
      });
  }, [propuestaId]);

  const programasFiltrados = useMemo(() => programas, [programas]);

  const [programasMesConciliado, programasResto] = useMemo(() => {
    if (!programasFiltrados || programasFiltrados.length === 0) return [[], []];
    const meses = programasFiltrados
      .map(p => p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0, 7) : null)
      .filter(Boolean);
    if (meses.length === 0) return [[], []];
    const mesMasReciente = meses.sort().reverse()[0];
    const mesConciliado = programasFiltrados.filter(p => {
      const mes = p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0, 7) : null;
      return mes === mesMasReciente;
    });
    const resto = programasFiltrados.filter(p => {
      const mes = p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0, 7) : null;
      return mes !== mesMasReciente;
    });
    return [mesConciliado, resto];
  }, [programasFiltrados]);

  const handleCancelarChange = (programaId, value) => {
    setProgramas(prevProgramas => prevProgramas.map(programa =>
      programa.id === programaId ? { ...programa, cancelar: value } : programa
    ));
  };

  const handleMontoPropuestoChange = (programaId, oportunidadId, nuevoMonto, moneda) => {
    setProgramas(prevState => {
      return prevState.map(programa => {
        if (programa.id !== programaId) {
          return programa;
        }
        return {
          ...programa,
          oportunidades: programa.oportunidades.map(oportunidad => {
            if (oportunidad.id_oportunidad !== oportunidadId) {
              return oportunidad;
            }
            return {
              ...oportunidad,
              monto_propuesto: Number(nuevoMonto),
              nueva_moneda: moneda || oportunidad.moneda
            };
          })
        };
      });
    });
  };

  const handleRevertirMonto = (programaId, oportunidadId) => {
    setProgramas(prevState => prevState.map(programa => {
      if (programa.id !== programaId) {
        return programa;
      }
      return {
        ...programa,
        oportunidades: programa.oportunidades.map(oportunidad => {
          if (oportunidad.id_oportunidad !== oportunidadId) {
            return oportunidad;
          }
          return {
            ...oportunidad,
            monto_propuesto: oportunidad.monto,
            nueva_moneda: null
          };
        })
      };
    }));
  };

  const mesConciliacion = useMemo(() => {
    const fechaStr = propuesta?.fecha_propuesta || propuesta?.creado_en;
    if (fechaStr) {
      const fecha = new Date(fechaStr);
      if (!isNaN(fecha)) {
        const mesConciliadoDate = subMonths(fecha, 1);
        const mesConciliadoTexto = formatDate(mesConciliadoDate, "LLLL yyyy", { locale: localeEs });
        const mesesAnteriores = [2, 3, 4].map(n => {
          const d = subMonths(fecha, n);
          return formatDate(d, "LLLL yyyy", { locale: localeEs });
        });
        return {
          mesConciliado: mesConciliadoTexto.charAt(0).toUpperCase() + mesConciliadoTexto.slice(1),
          mesesAnteriores: mesesAnteriores.map(m => m.charAt(0).toUpperCase() + m.slice(1))
        };
      }
    }
    return null;
  }, [propuesta]);
  const toggleExpand = programaId => {
    setExpanded(prev => ({ ...prev, [programaId]: !prev[programaId] }));
  };

  const handleConfirmarTodosCambios = () => {
    setShowConfirm(false);
    setIsLoading(true);

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id_usuario') || currentUser?.id_usuario;

    const datosAprobacion = {
      id_propuesta: Number(propuestaId),
      id_usuario: userId,
      estado: 'conciliado'
    };

    fetch(`http://127.0.0.1:8000/propuestas/${propuestaId}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosAprobacion)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(() => {
        setIsLoading(false);
        navigate('/main/propuestas', { replace: true });
      })
      .catch(error => {
        console.error('Error al actualizar la propuesta:', error);
        setIsLoading(false);
        alert(`Error al actualizar la propuesta: ${error.message}`);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      <PropuestasHeader titulo="Etapa : Pre-Conciliada" onBack={() => navigate('/main/propuestas')} />

      <PropuestaResumen
        propuesta={propuesta}
        formatearFecha={formatearFecha}
        handleConfirmarCambios={() => setShowConfirm(true)}
      />

      <Tabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mesConciliacion={mesConciliacion}
      />

      {isLoading ? (
        <LoadingModal />
      ) : (
        <>
          {activeTab === 'solicitudes' && (
            <SolicitudesAprobacionComercial
              propuesta={propuestaId}
              usuarioId={currentUser?.id_usuario}
            />
          )}
          {activeTab === 'mesConciliado' && (
            <ProgramasGrillaDAF
              programas={programasMesConciliado}
              expanded={expanded}
              onToggleExpand={toggleExpand}
              onToggleCancelar={handleCancelarChange}
              onChangeMonto={handleMontoPropuestoChange}
              onRevertMonto={handleRevertirMonto}
              selectedCarteras={selectedCarteras}
              setSelectedCarteras={setSelectedCarteras}
              estado={activeTab}
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
              selectedCarteras={selectedCarteras}
              setSelectedCarteras={setSelectedCarteras}
              estado={activeTab}
            />
          )}
        </>
      )}

      <ModalConfirmacion
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmarTodosCambios}
        title="Confirmar cambios"
        message="Esta seguro de que desea confirmar todos los cambios y marcar la propuesta como conciliada? Esta accion no se puede deshacer."
        confirmText="Confirmar cambios"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default DAFSubdirectorAPROBACION;


