import React from 'react';

const PropuestaResumen = ({ propuesta, formatearFecha, handleConfirmarCambios }) => {
  if (!propuesta) return null;

  return (
    <>
      {/* Wrapper de página con mismo ancho/padding que el header */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        {/* Tarjeta */}
        <div className="mt-4 bg-white rounded-2xl shadow-soft p-4 mb-4 border border-gray-100">
          {/* md: 2 cols | lg: 5 cols (Carteras = 2/5 = 40%) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2 lg:col-span-1">
              <label className="block text-2xl font-medium text-gray-700">Nombre</label>
              <label className="text-2xs text-gray-900">{propuesta.nombre}</label>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="block text-2xl font-medium text-gray-700">Fecha de Propuesta</label>
              <label className="text-2xs text-gray-900">
                {formatearFecha(propuesta.fecha_propuesta)}
              </label>
            </div>

            {/* Carteras 40% en lg */}
            <div className="space-y-2 md:col-span-2 lg:col-span-2">
              <label className="block text-2xl font-medium text-gray-700">Carteras</label>
              <label className="text-xs text-gray-900 break-words">
                {propuesta.carteras.join(', ')}
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropuestaResumen;
