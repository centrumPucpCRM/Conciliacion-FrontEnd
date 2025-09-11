import React, { useMemo } from 'react';

const Tabs = ({
  activeTab,
  onTabChange,
  mesConciliacion,
  propuesta,
}) => {
  return (
    <div className="px-12 mt-4">
      <div className="inline-flex bg-white shadow-sm overflow-hidden border border-gray-200">
        <button
          key="solicitudes"
          onClick={() => onTabChange('solicitudes')}
          className={`px-6 py-2 text-lg font-medium transition-colors focus:outline-none
            ${activeTab === 'solicitudes'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          Solicitudes
        </button>
        <button
          key="mesConciliado"
          onClick={() => onTabChange('mesConciliado')}
          className={`px-6 py-2 text-lg font-medium transition-colors focus:outline-none
            ${activeTab === 'mesConciliado'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          {`Mes conciliado: ${mesConciliacion?.mesConciliado ? mesConciliacion.mesConciliado.split(' ')[0] : ''}`}
        </button>
        <button
          key="mesesPasados"
          onClick={() => onTabChange('mesesPasados')}
          className={`px-6 py-2 text-lg font-medium transition-colors focus:outline-none
            ${activeTab === 'mesesPasados'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
              : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
          {`3 meses anteriores: ${mesConciliacion?.mesesAnteriores ? mesConciliacion.mesesAnteriores.map(m => m.split(' ')[0]).join(', ') : ''}`}
        </button>
      </div>
    </div>
  );
};

export default Tabs;
