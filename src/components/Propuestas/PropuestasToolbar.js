import React from 'react';

const PropuestasToolbar = ({
  busquedaNombre,
  setBusquedaNombre,
  rangoTexto,
  estadosTexto,
  carterasTexto,
  onOpenBusquedaAvanzada,
  onOpenNuevaPropuesta
}) => {
  return (
    <div className="px-12 mt-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 flex items-center text-2xl font-bold text-blue-700">
            <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg font-normal text-blue-900 bg-blue-50"
              placeholder="Buscar propuesta por nombre..."
              value={busquedaNombre}
              onChange={e => setBusquedaNombre(e.target.value)}
            />
          </div>

          {(rangoTexto || estadosTexto || carterasTexto) && (
            <div className="flex-1 min-w-[220px] text-sm capitalize text-blue-700 whitespace-pre-line leading-6">
              {rangoTexto && (
                <div>
                  <span className="font-semibold">Fecha:</span> {rangoTexto}
                </div>
              )}
              {estadosTexto && (
                <div>
                  <span className="font-semibold">Estados:</span> {estadosTexto}
                </div>
              )}
              {carterasTexto && (
                <div>
                  <span className="font-semibold">Carteras:</span> {carterasTexto}
                </div>
              )}
            </div>
          )}

          <button
            className="flex items-center gap-2 text-blue-700 hover:text-blue-900"
            onClick={onOpenBusquedaAvanzada}
          >
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            Búsqueda avanzada
          </button>
          {/* Botón nueva propuesta */}
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition"
            onClick={onOpenNuevaPropuesta}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva propuesta
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropuestasToolbar;