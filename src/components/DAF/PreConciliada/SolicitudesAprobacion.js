import React from 'react';

const SolicitudesAprobacion = ({
  solicitudes = [],
  activeTab = 'abiertas',
  onAprobar,
  onRechazar,
  isAprobada,
  isRechazada,
}) => {
  const visibles = React.useMemo(() => {
    if (activeTab === 'aprobadas') return solicitudes.filter(s => isAprobada(s.id));
    if (activeTab === 'rechazadas') return solicitudes.filter(s => isRechazada(s.id));
    // abiertas
    return solicitudes.filter(s => !isAprobada(s.id) && !isRechazada(s.id));
  }, [solicitudes, activeTab, isAprobada, isRechazada]);

  return (
    // Wrapper de página con mismo ancho/padding que ProgramasGrillaDAF
    <div className="mx-auto px-4 sm:px-6 lg:px-12">
      {/* Tarjeta con mismos estilos */}
      <div className="bg-white shadow-soft p-8 mb-8 border border-gray-200">
        {visibles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No hay solicitudes para esta vista</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[900px] text-sm">
              <colgroup>
                <col style={{ width: '10%' }} />
                <col style={{ width: '20%' }} />
                <col span="5" />
              </colgroup>

              {/* thead sticky como en ProgramasGrillaDAF */}
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr className="align-middle">
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider whitespace-nowrap truncate">
                    Cartera
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider whitespace-nowrap truncate">
                    Programa
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">
                    Solicitud
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-400">
                {visibles.map((solicitud) => {
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

                  const aprobada = isAprobada(solicitud.id);
                  const rechazada = isRechazada(solicitud.id);

                  return (
                    <tr
                      key={solicitud.id}
                      className={aprobada ? 'bg-green-50' : rechazada ? 'bg-red-50' : ''}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-gray-700">{solicitud.cartera}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900">{solicitud.programa}</td>
                      <td className="px-4 py-3 text-gray-900">
                        <div className="flex items-start gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                            {badgeText}
                          </span>

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
                        {!aprobada && !rechazada ? (
                          <div className="flex space-x-2 justify-center">
                            <button
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              onClick={() => onAprobar(solicitud.id)}
                            >
                              Aceptar
                            </button>
                            <button
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              onClick={() => onRechazar(solicitud.id)}
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              aprobada ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {aprobada ? 'Aprobada' : 'Rechazada'}
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
  );
};

export default SolicitudesAprobacion;
