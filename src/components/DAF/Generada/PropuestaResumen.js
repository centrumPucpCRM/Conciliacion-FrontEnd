import React from 'react';

const PropuestaResumen = ({ propuesta, formatearFecha, handlePreConciliar }) => {
  if (!propuesta) return null;

  return (
    <>
      {/* Wrapper con mismo ancho/padding que el header */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        {/* Tarjeta */}
        <div className="mt-4 bg-white rounded-2xl shadow-soft p-4 mb-4 border border-gray-100">
          {/* 
            Grilla:
            - md: 2 columnas
            - lg: 5 columnas (Carteras = 2 columnas => 40%)
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Nombre (20% en lg) */}
            <div className="space-y-2 lg:col-span-1">
              <label className="block text-2xl font-medium text-gray-700">Nombre</label>
              <label className="text-2xs text-gray-900">{propuesta.nombre}</label>
            </div>

            {/* Fecha de Propuesta (20% en lg) */}
            <div className="space-y-2 lg:col-span-1">
              <label className="block text-2xl font-medium text-gray-700">Fecha de Propuesta</label>
              <label className="text-2xs text-gray-900">
                {formatearFecha(propuesta.creado_en)}
              </label>
            </div>

            {/* Carteras (40% en lg, más espacio también en md) */}
            <div className="space-y-2 md:col-span-2 lg:col-span-2">
              <label className="block text-2xl font-medium text-gray-700">Carteras</label>
              <label className="text-xs text-gray-900 break-words">
                {propuesta.carteras.join(', ')}
              </label>
            </div>

            {/* Botón Pre-Conciliar (20% en lg) */}
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-soft hover:from-blue-600 hover:to-blue-700 transition 
                         justify-self-start md:justify-self-auto lg:justify-self-end self-center"
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
