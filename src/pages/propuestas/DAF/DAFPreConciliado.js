import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha } from '../../../utils/mockData';
import { usePropuestas } from '../../../context/PropuestasContext';
import { useProgramas } from '../../../context/ProgramasContext';
import PropuestasHeader from '../../../components/Propuestas/PropuestasHeader';
import PropuestaResumen from '../../../components/DAF/PreConciliada/PropuestaResumen';
import Tabs from '../../../components/DAF/PreConciliada/Tabs';
import SolicitudesAprobacion from '../../../components/DAF/PreConciliada/SolicitudesAprobacion';
import Ver from '../../../components/VerPropuesta';
const DAFPreConciliado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();
  const { propuestas } = usePropuestas();
  const { programas, refutarPorJP, setRefutarPorJP, setProgramas } = useProgramas();
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('solicitudes');

  const propuesta = propuestas.find(p => p.id === propuestaId) || {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'pre-conciliado',
    carteras: [],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  // Filtrar programas solo de las carteras de la propuesta
  const programasFiltrados = programas.filter(p => propuesta.carteras.includes(p.cartera));

  // --- Construcción de solicitudes (igual que antes) ---
  // Refutación de cancelación
  const solicitudesRefutacion = [];
  programasFiltrados.forEach(programa => {
    if (programa.cancelar) {
      Object.entries(refutarPorJP[programa.id] || {}).forEach(([jpId, refutado]) => {
        if (refutado) {
          solicitudesRefutacion.push({
            id: `refutacion_${programa.id}_${jpId}`,
            tipo: 'refutacion',
            cartera: programa.cartera,
            programa: programa.nombre,
            jpId: jpId,
            programaId: programa.id,
            descripcion: `JP refuta la cancelación del programa ${programa.nombre}`
          });
        }
      });
    }
  });

  // Alumnos (agregar / rechazos / contrapropuesta)
  const solicitudesAlumnos = [];
  programasFiltrados.forEach(programa => {
    const alumnosAgregados = programa.personas.filter(p => p.agregadoEnSesion);
    alumnosAgregados.forEach(alumno => {
      solicitudesAlumnos.push({
        id: `alumno_${programa.id}_${alumno.identificador}`,
        tipo: 'alumno',
        cartera: programa.cartera,
        programa: programa.nombre,
        programaId: programa.id,
        alumno,
        descripcion: `Agregar alumno ${alumno.identificador} al programa ${programa.nombre}`
      });
    });

    const montosDafRechazados = programa.personas.filter(p => p.monto_daf_rechazado);
    montosDafRechazados.forEach(alumno => {
      solicitudesAlumnos.push({
        id: `rechazo_daf_${programa.id}_${alumno.identificador}`,
        tipo: 'solicitudDafRechazada',
        cartera: programa.cartera,
        programa: programa.nombre,
        programaId: programa.id,
        alumno,
        descripcion: `El JP ha rechazado el monto propuesto por DAF para el alumno ${alumno.identificador}.\nMonto DAF: S/ ${alumno.monto_propuesto_daf || alumno.monto}.\nMonto JP: S/ ${alumno.monto_propuesto}`
      });
    });

    const contrapropuestasJP = programa.personas.filter(p => p.monto_contrapropuesto_por_jp);
    contrapropuestasJP.forEach(alumno => {
      solicitudesAlumnos.push({
        id: `contrapropuesta_jp_${programa.id}_${alumno.identificador}`,
        tipo: 'contrapropuestaJP',
        cartera: programa.cartera,
        programa: programa.nombre,
        programaId: programa.id,
        alumno,
        descripcion: `El JP propone el monto S/ ${alumno.monto_propuesto} para el alumno ${alumno.identificador}`
      });
    });
  });

  // --- Unificar en un solo contenedor ---
  const todasLasSolicitudes = [
    ...solicitudesRefutacion.map(s => ({ ...s, categoria: 'Refutación' })),
    ...solicitudesAlumnos.map(s => ({ ...s, categoria: 'Alumno' })),
  ];

  // --- Acciones (mismo comportamiento que tenías) ---
  const handleAprobarSolicitud = (solicitudId) => {
    setSolicitudesAprobadas(prev => new Set([...prev, solicitudId]));

    if (solicitudId.startsWith('refutacion_')) {
      const [, programaId] = solicitudId.split('_');
      setProgramas(prev => prev.map(p => (p.id === programaId ? { ...p, cancelar: false } : p)));
      setRefutarPorJP(prev => {
        const next = { ...prev };
        if (next[programaId]) delete next[programaId];
        return next;
      });
    }

    if (solicitudId.startsWith('alumno_')) {
      const [, programaId, identificador] = solicitudId.split('_');
      setProgramas(prev => prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map(persona =>
            persona.identificador === identificador
              ? { ...persona, agregadoEnSesion: false }
              : persona
          )
        };
      }));
    }

    if (solicitudId.startsWith('aceptado_daf_')) {
      const [, , programaId, identificador] = solicitudId.split('_');
      setProgramas(prev => prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map(persona =>
            persona.identificador === identificador
              ? { ...persona, monto_daf_aceptado_por_jp: false }
              : persona
          )
        };
      }));
    }

    if (solicitudId.startsWith('contrapropuesta_jp_')) {
      const [, , programaId, identificador] = solicitudId.split('_');
      setProgramas(prev => prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map(persona =>
            persona.identificador === identificador
              ? {
                  ...persona,
                  monto: persona.monto_propuesto,
                  monto_inicial: persona.monto_propuesto,
                  monto_propuesto: persona.monto_propuesto,
                  monto_editado_en_sesion: false,
                  monto_editado_por_jp: false,
                  monto_editado_por_daf: false,
                  monto_contrapropuesto_por_jp: false,
                  monto_daf_rechazado: false
                }
              : persona
          )
        };
      }));
    }

    if (solicitudId.startsWith('rechazo_daf_')) {
      const [, , programaId, identificador] = solicitudId.split('_');
      setProgramas(prev => prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map(persona =>
            persona.identificador === identificador
              ? {
                  ...persona,
                  monto: persona.monto_propuesto,
                  monto_inicial: persona.monto_propuesto,
                  monto_propuesto: persona.monto_propuesto,
                  monto_editado_en_sesion: false,
                  monto_editado_por_jp: false,
                  monto_editado_por_daf: false,
                  monto_contrapropuesto_por_jp: false,
                  monto_daf_rechazado: false
                }
              : persona
          )
        };
      }));
    }
  };

  const handleRechazarSolicitud = (solicitudId) => {
    setSolicitudesAprobadas(prev => new Set([...prev, `rechazada_${solicitudId}`]));

    if (solicitudId.startsWith('alumno_')) {
      const [, programaId, identificador] = solicitudId.split('_');
      setProgramas(prev => prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map(persona =>
            persona.identificador === identificador
              ? {
                  ...persona,
                  estado: 'interes',
                  fecha_estado: formatearFecha(new Date()),
                  monto: '',
                  moneda: '',
                  agregadoEnSesion: false
                }
              : persona
          )
        };
      }));
    }
  };

  const isSolicitudAprobada = (solicitudId) => solicitudesAprobadas.has(solicitudId);
  const isSolicitudRechazada = (solicitudId) =>
    !solicitudesAprobadas.has(solicitudId) && solicitudesAprobadas.has(`rechazada_${solicitudId}`);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      <PropuestasHeader titulo="Etapa : Pre-Conciliada" onBack={() => navigate('/main/propuestas')} />

      <PropuestaResumen
        propuesta={propuesta}
        formatearFecha={formatearFecha}
        handlePreConciliar={() => setShowConfirm(true)}
      />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'solicitudes' && (
          <SolicitudesAprobacion
            solicitudes={todasLasSolicitudes}
            activeTab={activeTab}
            onAprobar={handleAprobarSolicitud}
            onRechazar={handleRechazarSolicitud}
            isAprobada={isSolicitudAprobada}
            isRechazada={isSolicitudRechazada}
          />
        )}

        {activeTab === 'mesConciliado' && (
          <Ver estado={activeTab}/>
        )}

        {activeTab === 'mesesPasados' && (
          <Ver estado={activeTab}/>
        )}
    </div>
  );
};

export default DAFPreConciliado;
