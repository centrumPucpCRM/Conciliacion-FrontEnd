import {
  formatearFecha,
  obtenerColorEstado,
  tienePermiso,
  puedeCancelar,
} from '../../utils/mockData';
const TablaPropuestas = ({
  propuestas = [],
  currentRole,
  onEntrar,
  onVer,
  onCancelar,
  matrizPermisos,
  showMotivoCancelacion = false,
  // puedes ajustar este valor si quieres más/menos alto visible
  maxHeightClass = 'max-h-[60vh]' // ej: 'max-h-[calc(100vh-260px)]' o 'max-h-screen'
}) => {
  const noData = !propuestas || propuestas.length === 0;
  
  // Log para depuración

  return (
    <div className="px-12">
      <div className="bg-white border border-gray-200  shadow-lg p-8 mb-8">
        {noData ? (
          <div className="text-sm text-gray-500">No hay propuestas para mostrar.</div>
        ) : (
          // 👉 Contenedor scrollable: alto máximo + scroll en X e Y
          <div className={`overflow-auto ${maxHeightClass}`}>
            <table className="w-full min-w-[900px] text-sm">
              {/* 👉 Encabezado 'sticky' dentro del área scroll */}
              <thead className="bg-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">
                    Nombre de Propuesta
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">
                    Fecha de Propuesta
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">
                    Carteras
                  </th>
                  {showMotivoCancelacion && (
                    <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">
                      Motivo de Cancelación
                    </th>
                  )}
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-400">
                {propuestas.map((propuesta) => {
                  const nombre = propuesta?.nombre ?? '—';
                  const fechaTxt = propuesta?.creado_en
                    ? formatearFecha(propuesta.creado_en)
                    : '—';
                  const estado = propuesta?.estado_propuesta ?? '—';
                  const chipClase = obtenerColorEstado(estado) || '';
                  const carterasTxt = Array.isArray(propuesta?.carteras)
                    ? propuesta.carteras.join(', ')
                    : '—';
                  const motivoTxt = propuesta?.motivo_cancelacion ?? '—';

                  return (
                    <tr key={propuesta.id_propuesta} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap text-blue-900">{nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{fechaTxt}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs capitalize rounded-full ${chipClase}`}>
                          {estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate" title={carterasTxt}>
                          {carterasTxt}
                        </div>
                      </td>
                      {showMotivoCancelacion && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-sm truncate" title={motivoTxt}>
                            {motivoTxt}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {onEntrar && tienePermiso(matrizPermisos, currentRole, estado) && (
                            <button
                              className="px-3 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded-lg shadow text-xs font-semibold"
                              onClick={() => onEntrar(propuesta)}
                              aria-label="Entrar a la propuesta"
                            >
                              Entrar
                            </button>
                          )}
                          {onCancelar && estado !== 'CANCELADO' && puedeCancelar(matrizPermisos, currentRole) && (
                            <button
                              className="px-3 py-1 bg-red-500 hover:bg-red-700 text-white rounded-lg shadow text-xs font-semibold"
                              onClick={() => onCancelar(propuesta)}
                              aria-label="Cancelar propuesta"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
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

export default TablaPropuestas;
