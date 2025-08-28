import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha } from '../../../utils/mockData';
import { usePropuestas } from '../../../context/PropuestasContext';
import { useProgramas } from '../../../context/ProgramasContext';
import PropuestasHeader from '../../../components/Propuestas/PropuestasHeader';
import PropuestaResumen from '../../../components/DAF/PreConciliada/PropuestaResumen';

const DAFPreConciliado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();
  const { propuestas } = usePropuestas();
  const { programas, refutarPorJP, setRefutarPorJP, setProgramas } = useProgramas();
  const [solicitudesAprobadas, setSolicitudesAprobadas] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);

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

      {/* Contenido principal */}
      <div className="w-[99vw] box-border mx-auto px-6 py-8">
        {/* Solicitudes de aprobacion (UN SOLO CONTENEDOR) */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Solicitudes de aprobacion</h3>

          {todasLasSolicitudes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay solicitudes pendientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full divide-y divide-gray-200" style={{ minWidth: '90vw' }}>
                <colgroup>
                  <col style={{ width: '10%' }} />   {/* Cartera */}
                  <col style={{ width: '20%' }} />   {/* Programa */}
                  <col span="5" />                    {/* Resto */}
                </colgroup>
                <thead className="bg-gray-50">
                  <tr className="align-middle">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap truncate">
                      Cartera
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap truncate">
                      Programa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Solicitud
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {todasLasSolicitudes.map((solicitud) => {
                    // Badge por tipo (mismos colores que ya usabas)
                    const badgeClass =
                      solicitud.tipo === 'refutacion'
                        ? 'bg-orange-100 text-orange-800'
                        : solicitud.tipo === 'alumno'
                          ? 'bg-blue-100 text-blue-800'
                          : solicitud.tipo === 'solicitudDafRechazada'
                            ? 'bg-red-100 text-red-800'
                            : solicitud.tipo === 'contrapropuestaJP'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-800';

                    const badgeText =
                      solicitud.tipo === 'refutacion'
                        ? 'Refutación'
                        : solicitud.tipo === 'alumno'
                          ? 'Agregar Alumno'
                          : solicitud.tipo === 'solicitudDafRechazada'
                            ? 'Monto DAF Rechazado'
                            : solicitud.tipo === 'contrapropuestaJP'
                              ? 'Contrapropuesta JP'
                              : 'Solicitud';

                    return (
                      <tr
                        key={solicitud.id}
                        className={
                          isSolicitudAprobada(solicitud.id)
                            ? 'bg-green-50'
                            : isSolicitudRechazada(solicitud.id)
                              ? 'bg-red-50'
                              : ''
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{solicitud.cartera}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{solicitud.programa}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-start gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                              {badgeText}
                            </span>

                            {/* Detalle */}
                            <div>
                              {solicitud.tipo === 'alumno' ? (
                                <>
                                  <div className="font-medium">{solicitud.alumno.identificador}</div>
                                  <div className="text-xs text-gray-500">
                                    Monto: S/ {solicitud.alumno.monto} | Moneda: {solicitud.alumno.moneda}
                                  </div>
                                </>
                              ) : (
                                <div
                                  className="text-xs text-gray-600"
                                  dangerouslySetInnerHTML={{ __html: (solicitud.descripcion || '').replace(/\n/g, '<br />') }}
                                />
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {!isSolicitudAprobada(solicitud.id) && !isSolicitudRechazada(solicitud.id) ? (
                            <div className="flex space-x-2 justify-center">
                              <button
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                onClick={() => handleAprobarSolicitud(solicitud.id)}
                              >
                                Aceptar
                              </button>
                              <button
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                onClick={() => handleRechazarSolicitud(solicitud.id)}
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isSolicitudAprobada(solicitud.id)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isSolicitudAprobada(solicitud.id) ? 'Aprobada' : 'Rechazada'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DAFPreConciliado;
