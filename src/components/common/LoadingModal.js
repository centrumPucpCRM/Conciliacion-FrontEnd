import React from 'react';

const LoadingModal = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg p-8 shadow-xl flex flex-col items-center">
        {/* Círculo de carga animado */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">Cargando programas...</h2>
        <p className="text-sm text-gray-600 mt-2">Por favor espere mientras obtenemos la información</p>
      </div>
    </div>
  );
};

export default LoadingModal;
