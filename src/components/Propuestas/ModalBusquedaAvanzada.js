import React, { memo } from 'react';

export default memo(function ModalBusquedaAvanzada({
  isOpen,
  onClose,
  filtros,
  setFiltros,
  ESTADOS,
  todasCarteras,
  onApply,          // opcional; si no lo envías, solo cierra
}) {
  if (!isOpen) return null;

  const handleApply = () => {
    if (typeof onApply === 'function') onApply(filtros);
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 min-w-[350px] max-w-[90vw]">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Búsqueda avanzada</h2>

        <div className="space-y-4">
          {/* Fecha desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Creación - Desde
            </label>
            <input
              type="date"
              name="fechaInicio"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={filtros.fechaInicio}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
              }
            />
          </div>

          {/* Fecha hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Creación - Hasta
            </label>
            <input
              type="date"
              name="fechaFin"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={filtros.fechaFin}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))
              }
            />
          </div>

          {/* Estados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estados</label>
            <select
              name="estados"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                setFiltros((prev) => {
                  const alreadySelected = prev.estados.includes(value);
                  return {
                    ...prev,
                    estados: alreadySelected ? prev.estados : [...prev.estados, value],
                  };
                });
              }}
            >
              <option value="">Seleccionar estado...</option>
              {Object.values(ESTADOS).map((estado) => (
                <option key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>

            {/* Chips estados */}
            {filtros.estados.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filtros.estados.map((estado) => (
                  <span
                    key={estado}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {estado}
                    <button
                      type="button"
                      className="ml-1 text-blue-500 hover:text-blue-700 font-bold"
                      onClick={() =>
                        setFiltros((prev) => ({
                          ...prev,
                          estados: prev.estados.filter((e) => e !== estado),
                        }))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Carteras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carteras</label>
            <select
              name="carteras"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              onChange={(e) => {
                const value = e.target.value;
                if (!value) return;
                setFiltros((prev) => {
                  const alreadySelected = prev.carteras.includes(value);
                  return {
                    ...prev,
                    carteras: alreadySelected ? prev.carteras : [...prev.carteras, value],
                  };
                });
              }}
            >
              <option value="">Seleccionar cartera...</option>
              {todasCarteras.map((cartera) => (
                <option key={cartera} value={cartera}>
                  {cartera}
                </option>
              ))}
            </select>

            {/* Chips carteras */}
            {filtros.carteras.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filtros.carteras.map((cartera) => (
                  <span
                    key={cartera}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {cartera}
                    <button
                      type="button"
                      className="ml-1 text-green-500 hover:text-green-700 font-bold"
                      onClick={() =>
                        setFiltros((prev) => ({
                          ...prev,
                          carteras: prev.carteras.filter((c) => c !== cartera),
                        }))
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium"
            onClick={handleApply}
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
});
