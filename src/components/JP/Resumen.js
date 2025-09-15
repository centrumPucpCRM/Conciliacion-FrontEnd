import React, { useMemo } from 'react';
import { useRole } from '../../context/RoleContext';

const PropuestaResumen = ({ propuesta, formatearFecha, handleConfirmarCambios, todasAprobacionJPAbiertas }) => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
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
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="block text-2xl font-medium text-gray-700">Carteras</label>
              <label className="text-xs text-gray-900 break-words">
                {filteredCarteras.length > 0 
                  ? filteredCarteras.join(', ') 
                  : 'No hay carteras disponibles para su usuario'}
              </label>
            </div>
            {/* Botón Enviar Solicitud */}
            <div className="flex items-center justify-end lg:col-span-1 h-full">
              <button
                className={`px-8 py-3 text-base font-semibold rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${todasAprobacionJPAbiertas ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                style={{ minWidth: '170px', marginTop: 'auto', marginBottom: 'auto' }}
                onClick={todasAprobacionJPAbiertas ? handleConfirmarCambios : undefined}
                disabled={!todasAprobacionJPAbiertas}
              >
                {todasAprobacionJPAbiertas ? 'Enviar Solicitud' : '(Pendiente a Revisión)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropuestaResumen;
