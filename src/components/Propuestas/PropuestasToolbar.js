import React from "react";

const PropuestasToolbar = ({
  busquedaNombre,
  setBusquedaNombre,
  rangoTexto,
  estadosTexto,
  carterasTexto,
  onOpenBusquedaAvanzada,
  onOpenNuevaPropuesta,
}) => {
  const filtrosActivos = [rangoTexto, estadosTexto, carterasTexto].filter(Boolean);

  return (
    <div className="px-8 mt-4">
      <div className="border border-slate-200 rounded-2xl bg-white px-6 py-6 sm:px-8 sm:py-7 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full flex-1">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm font-medium text-slate-700 shadow-inner focus:border-sky-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="Buscar propuesta por nombre"
              value={busquedaNombre}
              onChange={(e) => setBusquedaNombre(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 self-end lg:self-auto">
            <button
              className="relative inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50"
              onClick={onOpenBusquedaAvanzada}
            >
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              <span>Busqueda avanzada</span>
              {filtrosActivos.length > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
                  {filtrosActivos.length}
                </span>
              )}
            </button>

            <button
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
              onClick={onOpenNuevaPropuesta}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva propuesta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropuestasToolbar;
