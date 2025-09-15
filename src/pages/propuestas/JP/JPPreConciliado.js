// pages/propuestas/JP/JPPreConciliado.jsx
import { format as formatDate, subMonths } from 'date-fns';
import { id, es as localeEs } from 'date-fns/locale';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha, ESTADOS } from '../../../utils/mockData';
import { usePropuestas } from '../../../context/PropuestasContext';
import { useProgramas } from '../../../context/ProgramasContext';
import { useRole } from '../../../context/RoleContext';
import PropuestasHeader from '../../../components/Propuestas/PropuestasHeader';
import PropuestaResumen from '../../../components/JP/Resumen';
import SolicitudesAprobacion from '../../../components/JP/SolicitudesAprobacion';
import ProgramasGrillaJP from '../../../components/JP/ProgramasGrillaJP';
import ProgramasGrillaJPRevision from '../../../components/JP/ProgramasGrillaJPRevision';
import Tabs from '../../../components/JP/Tabs';
import LoadingModal from '../../../components/common/LoadingModal';

const JPPreConciliado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();
  const { propuestas } = usePropuestas();
  const { programas, setProgramas } = useProgramas();
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [expanded, setExpanded] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCarteras, setSelectedCarteras] = useState([]);
  const [todasAprobacionJPAbiertas, setTodasAprobacionJPAbiertas] = useState(false);
  const { currentUser } = useRole();
  //Aca llama a ese enpoint que creaste y que si esta todas las ocliidutdes de ese tipo abiertas llene un true a un state

  // Buscar la propuesta real por id - intentando con ambos formatos de ID
  const propuesta = propuestas.find(p => 
    String(p.id_propuesta) === String(propuestaId) || 
    String(p.id) === String(propuestaId)
  ) || {
    id: propuestaId,
    id_propuesta: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'pre-conciliado',
    carteras: [],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  // Almacena las solicitudes para marcar oportunidades
  const [solicitudesOportunidad, setSolicitudesOportunidad] = useState([]);
  
  // Obtener las solicitudes para este JP y esta propuesta
  useEffect(() => {
    if (!propuestaId || !currentUser) {
      return;
    }
    
    const urlSolicitudes = `http://localhost:8000/solicitudes-pre-conciliacion/propuesta/${propuestaId}/usuario/${currentUser.id_usuario}`;
    
    fetch(urlSolicitudes)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && data.solicitudesPropuestaOportunidad) {
          setSolicitudesOportunidad(Array.isArray(data.solicitudesPropuestaOportunidad) 
            ? data.solicitudesPropuestaOportunidad 
            : []);
        }
      })
      .catch(err => {
        console.error('Error al obtener solicitudes:', err);
      });
  }, [propuestaId, currentUser]);

  // Llamada real al backend para obtener los programas de la propuesta
  useEffect(() => {
    if (!propuestaId) {
      return;
    }
    setIsLoading(true); // Comenzar a mostrar el estado de carga
    const url = `http://127.0.0.1:8000/propuestas/${propuestaId}/programas`;
    
    fetch(url)
      .then(res => {
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const programasServicio = data.map(p => ({
            ...p,
            id: `programa-${p.nombre}`,
            cancelar: Boolean(p.cancelar)
          }));


          const programasFiltrados = programasServicio.filter(p => p.id_jefe_producto == currentUser.id_usuario);
          
          // Marcar oportunidades que tienen solicitudes pendientes o rechazadas
          const programasConSolicitudes = programasFiltrados.map(programa => {
            // Copia profunda para no modificar el original directamente
            const programaConSolicitudes = {
              ...programa,
              oportunidades: programa.oportunidades ? programa.oportunidades.map(oportunidad => {
                // Buscar si esta oportunidad tiene una solicitud PENDIENTE o PENDIENTE A REVISION
                const solicitudRelacionada = solicitudesOportunidad.find(
                  s => s.dni_alumno === oportunidad.dni && 
                       (s.solicitud && 
                         (s.solicitud.valor_solicitud === 'PENDIENTE' || s.solicitud.valor_solicitud === 'PENDIENTE A REVISION' || s.solicitud.valor_solicitud === 'RECHAZADO')
                       )
                );
                return {
                  ...oportunidad,
                  EnSolicitud: !!solicitudRelacionada
                };
              }) : []
            };
            return programaConSolicitudes;
          });
          
          setProgramas(programasConSolicitudes);
        } else {
          console.warn('Los datos recibidos no son un array:', data);
        }
        setIsLoading(false); 
      })
      .catch(err => {
        console.error('Error al obtener programas de la propuesta:', err);
        setIsLoading(false);
      });
  }, [propuestaId, solicitudesOportunidad]);


  const programasFiltrados = programas
  
  // Separar programas en mes conciliado (más reciente) y 3 meses anteriores
  const [programasMesConciliado, programasResto] = useMemo(() => {
    if (!programasFiltrados || programasFiltrados.length === 0) return [[], []];
    // Obtener el mes más reciente (YYYY-MM)
    const meses = programasFiltrados
      .map(p => p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null)
      .filter(Boolean);
    if (meses.length === 0) return [[], []];
    const mesMasReciente = meses.sort().reverse()[0];
    const mesConciliado = programasFiltrados.filter(p => {
      const mes = p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null;
      return mes === mesMasReciente;
    });
    const resto = programasFiltrados.filter(p => {
      const mes = p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null;
      return mes !== mesMasReciente;
    });
    return [mesConciliado, resto];
  }, [programasFiltrados]);

  // Calcular el mes conciliado y los 3 meses anteriores en formato texto largo
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
  
  // Alumnos cuyo monto propuesto fue editado por JP
  const alumnosEditados = useMemo(() => {
    return (programasFiltrados || [])
      .flatMap(p => (p.oportunidades ?? []).map(o => ({ ...o, programaId: p.id, nombrePrograma: p.nombre })))
      .filter(o => o.monto_editado_en_sesion === true || o.monto_editado_por_jp === true);
  }, [programasFiltrados]);




  // Verificar si todas las solicitudes APROBACION_JP del usuario están abiertas
  useEffect(() => {
    if (!currentUser) return;
    const checkSolicitudesAbiertas = async () => {
      try {
        // Llama al endpoint GET para obtener todas las solicitudes APROBACION_JP del usuario
        const resp = await fetch(`http://localhost:8000/solicitud/aprobacion_jp/usuario/${currentUser.id_usuario}`);
        if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
        const solicitudes = await resp.json();
        // Si todas están abiertas (abierta === true), setear true
        if (Array.isArray(solicitudes) && solicitudes.length > 0) {
          const todasAbiertas = solicitudes.every(s => s.abierta === true);
          console.log('Todas las solicitudes APROBACION_JP están abiertas:', todasAbiertas,solicitudes);
          setTodasAprobacionJPAbiertas(todasAbiertas);
        } else {
          setTodasAprobacionJPAbiertas(false);
        }
      } catch (err) {
        console.error('Error al verificar solicitudes APROBACION_JP:', err);
        setTodasAprobacionJPAbiertas(false);
      }
    };
    checkSolicitudesAbiertas();
  }, [currentUser]);

  // Mostrar mensaje si no hay propuesta
  if (!propuesta) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center text-gray-700">
          Propuesta no encontrada.
        </div>
      </div>
    );
  }

  // Handler para manejar selección de No Aperturar
  const handleCancelarChange = (id) => {
    const programa = programasFiltrados.find(p => String(p.id) === String(id));
    
    if (!programa) {
      console.warn(`Programa con ID ${id} no encontrado para cambiar estado cancelar`);
      return;
    }
    
    const nuevoEstado = !programa.cancelar;
    setProgramas(prev => {
      const updated = prev.map(p => ({
        ...p,
        cancelar: String(p.id) === String(id) ? nuevoEstado : p.cancelar
      }));
      return updated;
    });
  };

  const handleMontoPropuestoChange = (programaId, identificador, nuevoMonto) => {
    setProgramas(prev => {
      const updated = prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          oportunidades: (p.oportunidades ?? []).map(oportunidad => {
            if (oportunidad.dni === identificador) {
              return {
                ...oportunidad,
                monto_inicial: oportunidad.monto,
                monto_propuesto: nuevoMonto,
                monto_propuesto_jp: nuevoMonto,
                monto_editado_en_sesion: true,
                monto_editado_por_jp: true,
                monto_editado_por_daf: false
              };
            }
            return oportunidad;
          })
        };
      });
      return updated;
    });
  };

  const handleRevertirMonto = (programaId, dni) => {
    setProgramas(prev => {
      const updated = prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          oportunidades: (p.oportunidades ?? []).map(oportunidad => {
            if (oportunidad.dni === dni) {
              return {
                ...oportunidad,
                monto_propuesto: oportunidad.monto,
                monto_propuesto_jp: oportunidad.monto,
                monto_editado_en_sesion: false,
                monto_editado_por_jp: false
              };
            }
            return oportunidad;
          })
        };
      });
      return updated;
    });
  };

  const toggleExpand = (programaId) => {
    setExpanded(prev => ({ ...prev, [programaId]: !prev[programaId] }));
  };
  
  // Función para enviar solicitudes a la API
  const enviarSolicitudAlBackend = async (endpoint, data) => {
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const resultado = await response.json();
      return { success: true, data: resultado };
    } catch (error) {
      console.error(`Error al enviar solicitud a ${endpoint}:`, error);
      return { success: false, error: error.message };
    }
  };

  const handleConfirmRevisado = async () => {
    setIsLoading(true);
    // 1. Actualizar monto_propuesto en backend para cada oportunidad editada
    await Promise.all(alumnosEditados.map(async (alumno) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/propuesta_oportunidad/${alumno.id_propuesta_oportunidad}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monto_propuesto: alumno.monto_propuesto_jp })
        });
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error actualizando monto_propuesto para oportunidad ${alumno.id_propuesta_oportunidad}:`, errorText);
        }
      } catch (err) {
        console.error(`Error de red actualizando oportunidad ${alumno.id_propuesta_oportunidad}:`, err);
      }
    }));

    // 2. Generar solicitud para cada alumno editado
    const solicitudesAlumnos = alumnosEditados.map(alumno => ({
      id_propuesta: Number(propuestaId),
      id_propuesta_oportunidad: Number(alumno.id_propuesta_oportunidad),
      id_usuario_generador: currentUser.id_usuario,
      id_usuario_receptor: 1,
      monto_propuesto: Number(alumno.monto_propuesto_jp),
      monto_objetado: null,
      comentario: `${currentUser.nombres} ajustó el monto propuesto de ${alumno.monto} a ${alumno.monto_propuesto_jp}`
    }));

    // Esperar a que todas las solicitudes sean creadas antes de consultar
    await Promise.all(
      solicitudesAlumnos.map(solicitud =>
        enviarSolicitudAlBackend('/solicitudes/daf/oportunidad/monto/', solicitud)
      )
    );
    // Ahora consultar las solicitudes del usuario para esta propuesta
    try {
      const urlSolicitudes = `http://localhost:8000/solicitudes-pre-conciliacion/propuesta/${propuestaId}/usuario/${currentUser.id_usuario}`;
      const resp = await fetch(urlSolicitudes);
      if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
      const data = await resp.json();
      const solicitudesOportunidad = Array.isArray(data.solicitudesPropuestaOportunidad) ? data.solicitudesPropuestaOportunidad : [];
      const solicitudesPrograma = Array.isArray(data.solicitudesPropuestaPrograma) ? data.solicitudesPropuestaPrograma : [];
      const todasSolicitudes = [...solicitudesOportunidad, ...solicitudesPrograma];
      // Filtrar las que no están aceptadas y no son de tipo ELIMINACION_BECADO
      const noAceptadas = todasSolicitudes.filter(s =>
        s.solicitud &&
        s.solicitud.valor_solicitud !== 'ACEPTADO' &&
        s.solicitud.tipo_solicitud !== 'ELIMINACION_BECADO'
      );
      if (noAceptadas.length > 0) {
        console.log('Solicitudes pendientes o rechazadas (excluyendo ELIMINACION_BECADO):', noAceptadas);
      } else {
        console.log('Todas aceptadas y listado:', todasSolicitudes);
        // Si todas están aceptadas, cerrar las solicitudes APROBACION_JP del usuario
        try {
          const cerrarResp = await fetch(`http://localhost:8000/solicitud/aprobacion_jp/usuario/${currentUser.id_usuario}/cerrar`, {
            method: 'PATCH'
          });
          if (!cerrarResp.ok) {
            const cerrarText = await cerrarResp.text();
            console.error('Error al cerrar solicitudes APROBACION_JP:', cerrarText);
          } else {
            console.log('Solicitudes APROBACION_JP cerradas correctamente');
          }
        } catch (cerrarErr) {
          console.error('Error al cerrar solicitudes APROBACION_JP:', cerrarErr);
        }
      }
    } catch (err) {
      console.error('Error al verificar estado de solicitudes:', err);
    }
    setIsLoading(false);
    window.location.reload();
    //Ahora a todas las solicitudes del usuario
  };




  return (
    <div className="min-h-screen bg-gray-100">
      <PropuestasHeader onBack={() => navigate('/main/propuestas')} titulo="Etapa : Pre-Conciliada" />

      <PropuestaResumen
        propuesta={propuesta}
        formatearFecha={formatearFecha}
        handleConfirmarCambios={handleConfirmRevisado}
        todasAprobacionJPAbiertas={todasAprobacionJPAbiertas}
      />

      <Tabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        mesConciliacion={mesConciliacion} 
      />
      
      {/* Mostrar el modal de carga mientras isLoading es true */}
      {isLoading ? (
        <LoadingModal />
      ) : (
        <>
          {activeTab === 'solicitudes' && (
            <SolicitudesAprobacion propuesta={propuestaId} />
          )}

          {activeTab === 'mesConciliado' && (
                <ProgramasGrillaJP 
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
              )
          }
          {activeTab === 'mesesPasados' && (
            <ProgramasGrillaJPRevision 
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
    </div>
  );
};

export default JPPreConciliado;
