import React from 'react';

const PropuestaResumen = ({ propuesta, formatearFecha,handlePreConciliar }) => {
  if (!propuesta) return null;

  return (
    <>
      {/* Wrapper de página con mismo ancho/padding que el header */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        {/* Tarjeta */}
        <div className="mt-4 bg-white rounded-2xl shadow-soft p-4 mb-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-gray-700">Nombre</label>
              <label className="text-2xs text-gray-900">{propuesta.nombre}</label>
            </div>
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-gray-700">Fecha de Propuesta</label>
              <label className="text-2xs text-gray-900">
                {formatearFecha(propuesta.fecha_propuesta)}
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-2xl font-medium text-gray-700">Carteras</label>
              <label className="text-2xs text-gray-900">
                {propuesta.carteras.join(', ')}
              </label>
            </div>
            {/* Botón Pre-Conciliar */}
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-soft transition-colors hover:from-blue-600 hover:to-blue-700 transitiontext-lg"

              onClick={handlePreConciliar}
            >
            Pre-Conciliar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropuestaResumen;
