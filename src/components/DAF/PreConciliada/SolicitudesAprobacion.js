import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useRole } from '../../../context/RoleContext';
import ModalConfirmacion from '../../ModalConfirmacion';

// PATCH solicitud helper
const patchSolicitud = async (id, body) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/solicitudes-pre-conciliacion/solicitud/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Error al actualizar solicitud');
    return await res.json();
  } catch (e) {
    alert('Error al actualizar solicitud');
    return null;
  }
};

const SolicitudesAprobacion = ({ propuesta }) => {
  const [solicitudesOportunidad, setSolicitudesOportunidad] = useState([]);
  const [solicitudesPrograma, setSolicitudesPrograma] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [modalTipo, setModalTipo] = useState(null); // 'ACEPTAR' | 'REFUTAR' | null
  const [montoObj, setMontoObj] = useState('');
  const [showMontoModal, setShowMontoModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { currentUser } = useRole();

  useEffect(() => {
    if (!currentUser || !propuesta) {
      setIsLoading(false);
      return;
    }
    // Extraemos el ID de la propuesta, ya sea un objeto o directamente el ID
    const propuestaId = typeof propuesta === 'object' ? propuesta.id_propuesta : propuesta;    
    if (!propuestaId) {
      setIsLoading(false);
      return;
    }
    
    // Obtener el id_usuario de la URL si existe, de lo contrario usar currentUser.id_usuario
    setIsLoading(true); // Comenzar a mostrar el estado de carga
    const url = `http://localhost:8000/solicitudes-pre-conciliacion/propuesta/${propuestaId}/usuario/${currentUser.id_usuario}`;
    
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setSolicitudesOportunidad(Array.isArray(data.solicitudesPropuestaOportunidad) ? data.solicitudesPropuestaOportunidad : []);
        setSolicitudesPrograma(Array.isArray(data.solicitudesPropuestaPrograma) ? data.solicitudesPropuestaPrograma : []);
        setError(null);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar solicitudes para DAF:', err);
        setError('No se pudieron cargar las solicitudes. Por favor, intente nuevamente.');
        setIsLoading(false);
      });
  }, [currentUser, propuesta]);

  // Estado visual según reglas de negocio
  const getEstadoVisual = (solicitud, s) => {
    console.log("Info de: ",s.id_usuario_generador, currentUser?.id_usuario)
    if ((s.valor_solicitud === 'RECHAZADO' || s.valor_solicitud === 'PENDIENTE' ) && 
        s.id_usuario_generador == currentUser?.id_usuario) {
      return 'PENDIENTE A REVISION';
    }
    
    return s.valor_solicitud || s.estado;
  }
  
  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
      case 'PENDIENTE A REVISION':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACEPTADO':
        return 'bg-green-100 text-green-800';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const handleAbrirModal = (solicitud, tipo) => {
    // Log de la estructura completa de la solicitud para ver exactamente qué IDs tenemos
    const s = solicitud.solicitud ? solicitud.solicitud : solicitud;
    
    setModalData(solicitud);
    setModalTipo(tipo);
    if (tipo === 'REFUTAR') {
      setShowMontoModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleCerrarModal = () => {
    setModalData(null);
    setModalTipo(null);
    setShowMontoModal(false);
    setShowConfirmModal(false);
    setMontoObj('');
  };

  const handleConfirmar = async () => {
    if (!modalData) return;
    
    // Obtener correctamente los IDs desde la estructura anidada
    const s = modalData.solicitud ? modalData.solicitud : modalData;
    const id_solicitud = s.id_solicitud;
    const id_usuario_receptor = s.id_usuario_receptor;
    const id_usuario_generador = s.id_usuario_generador;
    
    let body;
    if (modalTipo === 'ACEPTAR') {
      body = { valor_solicitud: 'ACEPTADO' };
    } else if (modalTipo === 'REFUTAR') {
      if (!montoObj) {
        alert('El monto es requerido para refutar');
        return;
      }
      body = {
        valor_solicitud: 'RECHAZADO',
        monto_objetado: Number(montoObj),
        id_usuario_generador: id_usuario_receptor,
        id_usuario_receptor: id_usuario_generador,
        comentario: `El DAF propone ${montoObj} sobre esta solicitud anterior\nSolicitud anterior: ${s.comentario}`
      };
    }
    await patchSolicitud(id_solicitud, body);
    handleCerrarModal();
    window.location.reload();
  };
  
  // Modal para ingresar monto al refutar y confirmar de inmediato
  const renderMontoModal = () => {
    if (!showMontoModal || !modalData) return null;
    return (
      <ModalConfirmacion
        isOpen={showMontoModal}
        onClose={handleCerrarModal}
        onConfirm={async () => {
          if (!montoObj) {
            alert('El monto es requerido para refutar');
            return;
          }
          
          const s = modalData.solicitud ? modalData.solicitud : modalData;
          const id_solicitud = s.id_solicitud;
          const id_usuario_receptor = s.id_usuario_receptor;
          const id_usuario_generador = s.id_usuario_generador;
          
          const body = {
            valor_solicitud: 'RECHAZADO',
            monto_objetado: Number(montoObj),
            id_usuario_generador: id_usuario_receptor,
            id_usuario_receptor: id_usuario_generador,
            comentario: `El DAF propone ${montoObj} sobre esta solicitud anterior\nSolicitud anterior: ${s.comentario}`
          };
          await patchSolicitud(id_solicitud, body);
          handleCerrarModal();
          window.location.reload();
        }}
        title="Monto a objetar"
        message={<>
          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Monto objetado:</label>
            <input
              type="number"
              className="mt-2 block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 text-base"
              placeholder="Ingrese el monto"
              value={montoObj}
              onChange={(e) => setMontoObj(e.target.value)}
            />
          </div>
        </>}
        confirmText="Refutar"
        cancelText="Cancelar"
      />
    );
  };

  // Modal de confirmación solo para aceptar
  const renderConfirmModal = () => {
    if (!showConfirmModal || !modalData) return null;
    return (
      <ModalConfirmacion
        isOpen={showConfirmModal}
        onClose={handleCerrarModal}
        onConfirm={handleConfirmar}
        title="Confirmar aceptación"
        message={'¿Estás seguro de que deseas aceptar esta solicitud?'}
        confirmText="Aceptar"
        cancelText="Cancelar"
      />
    );
  };
  
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-12">
      <div className="bg-white shadow-soft p-6 mb-8 border border-gray-200 rounded-lg">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Cargando solicitudes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2 mt-4">Solicitudes de Oportunidad</h3>
            {solicitudesOportunidad.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No hay solicitudes de oportunidad.</div>
            ) : (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Alumno</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">DNI Alumno</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto CRM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {solicitudesOportunidad.map(solicitud => {
                      const s = solicitud.solicitud ? solicitud.solicitud : solicitud;
                      const estadoVisual = getEstadoVisual(solicitud, s);
                      if (s.tipo_solicitud === "EDICION_ALUMNO") {
                        return (
                          <tr key={solicitud.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(estadoVisual)}`}>{estadoVisual}</span>
                            </td>
                            <td className="px-6 py-4 break-words text-sm text-gray-500" style={{maxWidth: '300px', whiteSpace: 'normal'}}>{solicitud.nombre_programa}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solicitud.nombre_alumno}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{solicitud.dni_alumno}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">{solicitud.monto !== undefined && solicitud.monto !== null ? solicitud.monto : '-'}</td>
                            <td className="px-6 py-4 break-words text-sm text-gray-500" style={{maxWidth: '300px', whiteSpace: 'normal'}}>{s.comentario}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                              {(estadoVisual == 'PENDIENTE' || estadoVisual == 'RECHAZADO') && (
                                <>
                                  <button className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-1 px-3 rounded shadow text-xs" onClick={() => handleAbrirModal(solicitud, 'ACEPTAR')}>Aceptar</button>
                                  <button className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-3 rounded shadow text-xs" onClick={() => handleAbrirModal(solicitud, 'REFUTAR')}>Refutar</button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <h3 className="text-lg font-semibold mb-2 mt-4">Solicitudes de Programa</h3>
            {solicitudesPrograma.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No hay solicitudes de programa.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receptor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Propuesta Programa</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {solicitudesPrograma.map(solicitud => {
                      // Si viene anidado en 'solicitud', usar esos datos
                      const s = solicitud.solicitud ? solicitud.solicitud : solicitud;
                      return (
                        <tr key={solicitud.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.id_solicitud}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClass(getEstadoVisual(solicitud, s))}`}>{getEstadoVisual(solicitud, s)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ID: {s.id_usuario_generador}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ID: {s.id_usuario_receptor}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{solicitud.id_propuesta_programa}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(s.creado_en || s.fecha_creacion)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {renderMontoModal()}
            {renderConfirmModal()}
          </>
        )}
      </div>
    </div>
  );
};
export default SolicitudesAprobacion;