// src/components/Propuestas/ModalBusquedaAvanzada.jsx
import React, { memo, useEffect, useRef, useState } from 'react';

function MultiSelect({
  placeholder = 'Seleccionar…',
  options = [],
  selected = [],
  onChange,
  chipColor = 'blue', // 'blue' | 'green'
}) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState('down');
  const btnRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!open) return;
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const spaceBelow = viewportH - rect.bottom;
      const needed = 240;
      setDirection(spaceBelow < needed ? 'up' : 'down');
    }
    setOpen((v) => !v);
  };

  const allSelected = options.length > 0 && selected.length === options.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) onChange([]);
    else onChange([...options]);
  };

  const toggleOne = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter((x) => x !== opt));
    else onChange([...selected, opt]);
  };

  const chipBg = chipColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
  const chipX  = chipColor === 'green' ? 'text-green-500 hover:text-green-700' : 'text-blue-500 hover:text-blue-700';

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={toggleOpen}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <span className={selected.length ? 'text-gray-900' : 'text-gray-500'}>
          {selected.length
            ? `${selected.length} seleccionad${selected.length === 1 ? 'a' : 'as'}`
            : placeholder}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          className={`absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto ${
            direction === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {/* Seleccionar todos */}
          <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3" onClick={toggleAll}>
            <input
              type="checkbox"
              readOnly
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected; }}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Seleccionar todos</span>
          </div>
          <div className="border-t border-gray-200" />

          {/* Opciones */}
          {options.map((opt) => (
            <label key={opt} className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggleOne(opt)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((v) => (
            <span key={v} className={`flex items-center gap-1 px-3 py-1 ${chipBg} rounded-full text-sm`}>
              {v}
              <button
                type="button"
                className={`ml-1 font-bold ${chipX}`}
                onClick={() => onChange(selected.filter((x) => x !== v))}
                aria-label={`Quitar ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const SELECT_ALL_STATE = {
  fechaInicio: '',
  fechaFin: '',
  estados: [],
  carteras: [],
};

export default memo(function ModalBusquedaAvanzada({
  isOpen,
  onClose,
  filtros,
  setFiltros,
  ESTADOS,
  todasCarteras,
  onApply, // opcional
}) {
  if (!isOpen) return null;
    
  // Validación de rango de fechas: permite mismo día (Desde ≤ Hasta)
  const invalidDateRange =
    filtros.fechaInicio &&
    filtros.fechaFin &&
    filtros.fechaInicio > filtros.fechaFin; // YYYY-MM-DD se puede comparar como string

  const handleApply = () => {
    if (invalidDateRange) return; // no aplicar si es inválido
    if (typeof onApply === 'function') onApply(filtros);
    onClose?.();
  };

  const handleCancel = () => {
    setFiltros(SELECT_ALL_STATE); // limpiar todo
    onClose?.();
  };

  const setEstados = (arr) =>
    setFiltros((prev) => ({ ...prev, estados: Array.from(new Set(arr)) }));

  const setCarteras = (arr) =>
    setFiltros((prev) => ({ ...prev, carteras: Array.from(new Set(arr)) }));

  const estadosOptions = Array.from(new Set(Object.values(ESTADOS)));
  const carterasOptions = Array.from(new Set(todasCarteras));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
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
              className={`w-full px-4 py-2 border rounded-lg ${invalidDateRange ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
              value={filtros.fechaInicio}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
              }
              aria-invalid={invalidDateRange ? 'true' : 'false'}
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
              className={`w-full px-4 py-2 border rounded-lg ${invalidDateRange ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}`}
              value={filtros.fechaFin}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))
              }
              aria-invalid={invalidDateRange ? 'true' : 'false'}
            />
            {invalidDateRange && (
              <p className="text-red-600 text-sm mt-2">
                La fecha <strong>Desde</strong> debe ser menor o igual que la fecha <strong>Hasta</strong>.
              </p>
            )}
          </div>

          {/* Estados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estados</label>
            <MultiSelect
              placeholder="Seleccionar estado(s)…"
              options={estadosOptions}
              selected={filtros.estados}
              onChange={setEstados}
              chipColor="blue"
            />
          </div>

          {/* Carteras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carteras</label>
            <MultiSelect
              placeholder="Seleccionar cartera(s)…"
              options={carterasOptions}
              selected={filtros.carteras}
              onChange={setCarteras}
              chipColor="green"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-white font-medium ${invalidDateRange ? 'bg-blue-400 cursor-not-allowed opacity-60' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleApply}
            disabled={invalidDateRange}
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
});
