

import React, { useState, useEffect } from 'react';

const ConfirmModal = ({ open, onClose, onConfirm, mensaje }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <p className="mb-4 text-gray-700 text-center">{mensaje}</p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onConfirm}>Confirmar</button>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const SolicitudesAprobacion = ({ propuesta, usuarioId }) => {
  const [solicitudesGenerales, setSolicitudesGenerales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, solicitudId: null, accion: null });

  useEffect(() => {
    console.log('Ejecutando useEffect SD/SolicitudesAprobacion', { propuesta, usuarioId });
    if (!propuesta || !usuarioId) {
      setIsLoading(false);
      return;
    }
    const propuestaId = typeof propuesta === 'object' ? propuesta.id_propuesta : propuesta;
    if (!propuestaId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const url = `http://localhost:8000/solicitudes-pre-conciliacion/propuesta/${propuestaId}/usuario/${usuarioId}`;
    console.log('URL fetch:', url);
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => {
        console.log('Respuesta backend:', data);
        let solicitudes = [];
        if (data && Array.isArray(data.solicitudesGenerales)) {
          solicitudes = data.solicitudesGenerales;
        } else if (Array.isArray(data)) {
          solicitudes = data;
        }
        console.log('SolicitudesGenerales usadas:', solicitudes);
        setSolicitudesGenerales(solicitudes);
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error en fetch SD/SolicitudesAprobacion:', err);
        setError('No se pudieron cargar las solicitudes. Por favor, intente nuevamente.');
        setIsLoading(false);
      });
  }, [propuesta, usuarioId]);

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
          <div>
            <h3 className="text-lg font-semibold mb-2 mt-4">Solicitudes de Aprobación JP</h3>
            {solicitudesGenerales.filter(s => s.tipo_solicitud === "APROBACION_JP").length === 0 ? (
              <div className="text-center py-4 text-gray-500">No hay solicitudes de aprobación JP.</div>
            ) : (
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comentario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {solicitudesGenerales.filter(s => s.tipo_solicitud === "APROBACION_JP").map(solicitud => (
                      <tr key={solicitud.id_solicitud} className="hover:bg-gray-50">
                        <td className="px-6 py-4 break-words text-sm text-gray-500" style={{maxWidth: '300px', whiteSpace: 'normal'}}>{solicitud.comentario}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {solicitud.abierta ? (
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold text-xs">Pendiente a revisión por el JP</span>
                          ) : solicitud.valor_solicitud === 'ACEPTADO' ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-xs">Cerrada y ACEPTADA</span>
                          ) : solicitud.valor_solicitud === 'RECHAZADO' ? (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold text-xs">Cerrada y RECHAZADA</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-semibold text-xs">Cerrada</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                          {/* Si la solicitud está cerrada pero no rechazada, mostrar Aceptar/Rechazar según estado */}
                          {!solicitud.abierta && (
                            <>
                              {solicitud.valor_solicitud !== 'ACEPTADO' && (
                                <button
                                  className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold py-1 px-3 rounded shadow text-xs"
                                  onClick={() => setModal({ open: true, solicitudId: solicitud.id_solicitud, accion: 'ACEPTAR' })}
                                >Aceptar</button>
                              )}
                              <button
                                className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-1 px-3 rounded shadow text-xs"
                                onClick={() => setModal({ open: true, solicitudId: solicitud.id_solicitud, accion: 'RECHAZAR' })}
                              >Rechazar</button>
      {/* Modal de confirmación */}
      <ConfirmModal
        open={modal.open}
        mensaje={modal.accion === 'ACEPTAR' ? '¿Está seguro que desea aceptar esta solicitud?' : '¿Está seguro que desea rechazar esta solicitud?'}
        onClose={() => setModal({ open: false, solicitudId: null, accion: null })}
        onConfirm={async () => {
          if (!modal.solicitudId || !modal.accion) return;
          try {
            const res = await fetch(`http://localhost:8000/solicitudes-pre-conciliacion/solicitud/${modal.solicitudId}/accion`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ accion: modal.accion })
            });
            if (!res.ok) throw new Error('Error al actualizar solicitud');
            setSolicitudesGenerales(prev => prev.map(s =>
              s.id_solicitud === modal.solicitudId
                ? { ...s, valor_solicitud: modal.accion === 'ACEPTAR' ? 'ACEPTADO' : 'RECHAZADO' }
                : s
            ));
            setModal({ open: false, solicitudId: null, accion: null });
            window.location.reload();
          } catch (err) {
            alert('No se pudo actualizar la solicitud.');
            setModal({ open: false, solicitudId: null, accion: null });
          }
        }}
      />
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SolicitudesAprobacion;
                               