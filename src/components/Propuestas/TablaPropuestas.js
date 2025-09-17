import {
  formatearFecha,
  obtenerColorEstado,
  tienePermiso,
  puedeCancelar,
} from "../../utils/mockData";

const TablaPropuestas = ({
  propuestas = [],
  currentRole,
  onEntrar,
  onVer,
  onCancelar,
  matrizPermisos,
  showMotivoCancelacion = false,
  maxHeightClass = "max-h-[60vh]",
}) => {
  const noData = !propuestas || propuestas.length === 0;

  return (
    <div className="px-8 mt-1">
      <div className="border border-slate-200 rounded-2xl bg-white px-6 py-6 sm:px-8 shadow-sm">
        {noData ? (
          <div className="text-sm text-slate-500">No hay propuestas para mostrar.</div>
        ) : (
          <div className={`overflow-auto ${maxHeightClass}`}>
            <table className="w-full min-w-[900px] text-sm text-slate-600">
              <thead className="sticky top-0 z-10 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nombre de propuesta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Fecha de propuesta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Carteras
                  </th>
                  {showMotivoCancelacion && (
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Motivo de cancelacion
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {propuestas.map((propuesta) => {
                  const nombre = propuesta?.nombre ?? "N/A";
                  const fechaTxt = propuesta?.creado_en ? formatearFecha(propuesta.creado_en) : "N/A";
                  const estado = propuesta?.estado_propuesta ?? "N/A";
                  const chipClase = obtenerColorEstado(estado) || "";
                  const carterasTxt = Array.isArray(propuesta?.carteras)
                    ? propuesta.carteras.join(", ")
                    : "N/A";
                  const motivoTxt = propuesta?.motivo_cancelacion ?? "N/A";

                  return (
                    <tr key={propuesta.id_propuesta} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">{nombre}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{fechaTxt}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-wide bg-slate-100 text-slate-600 ${chipClase}`}
                        >
                          {estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="max-w-xs truncate" title={carterasTxt}>
                          {carterasTxt}
                        </div>
                      </td>
                      {showMotivoCancelacion && (
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          <div className="max-w-sm truncate" title={motivoTxt}>
                            {motivoTxt}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          {onEntrar && tienePermiso(matrizPermisos, currentRole, estado) && (
                            <button
                              className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600"
                              onClick={() => onEntrar(propuesta)}
                              aria-label="Entrar a la propuesta"
                            >
                              Entrar
                            </button>
                          )}
                          {onVer && (
                            <button
                              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                              onClick={() => onVer(propuesta)}
                              aria-label="Ver detalle de la propuesta"
                            >
                              Ver detalle
                            </button>
                          )}
                          {onCancelar && estado !== "CANCELADO" && puedeCancelar(matrizPermisos, currentRole) && (
                            <button
                              className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600"
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
