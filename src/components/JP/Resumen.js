import React, { useMemo } from 'react';
import { useRole } from '../../context/RoleContext';

const PropuestaResumen = ({ propuesta, formatearFecha, handleConfirmarCambios }) => {
  const { currentUser } = useRole();
  
  // Filtrar carteras de la propuesta para mostrar solo las del usuario actual
  const userCarterasNames = useMemo(() => {
    if (!currentUser?.carteras) return [];
    return currentUser.carteras.map(c => 
      typeof c === 'object' && c.nombre ? c.nombre : c
    );
  }, [currentUser]);
  
  const filteredCarteras = useMemo(() => {
    if (!propuesta?.carteras || !userCarterasNames.length) return propuesta?.carteras || [];
    return propuesta.carteras.filter(cartera => userCarterasNames.includes(cartera));
  }, [propuesta, userCarterasNames]);
  
  if (!propuesta) return null;

  return (
    <>
      {/* Wrapper con mismo ancho/padding que el header */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        {/* Tarjeta */}
        <div className="mt-4 bg-white rounded-2xl shadow-soft p-4 mb-4 border border-gray-100">
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

            {/* Carteras (40% en lg, más espacio en md) */}
            <div className="space-y-2 md:col-span-2 lg:col-span-2">
              <label className="block text-2xl font-medium text-gray-700">Carteras</label>
              <label className="text-xs text-gray-900 break-words">
                {filteredCarteras.length > 0 
                  ? filteredCarteras.join(', ') 
                  : 'No hay carteras disponibles para su usuario'}
              </label>
            </div>

            {/* Botón Confirmar cambios (20% en lg) */}
            <button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-lg shadow-soft hover:from-blue-600 hover:to-blue-700 transition 
                         justify-self-start md:justify-self-auto lg:justify-self-end self-center"
              onClick={handleConfirmarCambios}
            >
              Confirmar cambios
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropuestaResumen;
