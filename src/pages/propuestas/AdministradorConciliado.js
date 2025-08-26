import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha, obtenerColorEstado } from '../../utils/mockData';

const AdministradorConciliado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();

  const propuesta = {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'conciliado',
    carteras: ['Cartera Comercial', 'Cartera Personal'],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                onClick={() => navigate('/main/propuestas')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Volver a Propuestas</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-teal rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Propuesta Conciliada</h1>
                <p className="text-gray-600 text-sm">Como Administrador, puede gestionar la propuesta ya conciliada</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Información de la propuesta */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-teal rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Información de la Propuesta</h2>
              <p className="text-gray-600">Detalles y configuración actual</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ID de Propuesta</label>
              <p className="text-sm text-gray-900 font-mono">{propuesta.id}</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <p className="text-sm text-gray-900">{propuesta.nombre}</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${obtenerColorEstado(propuesta.estado)}`}>
                Conciliado
              </span>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fecha de Propuesta</label>
              <p className="text-sm text-gray-900">{formatearFecha(propuesta.fecha_propuesta)}</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Carteras</label>
              <p className="text-sm text-gray-900">{propuesta.carteras.join(', ')}</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Rol Actual</label>
              <p className="text-sm text-gray-900">Administrador</p>
            </div>
          </div>
        </div>

        {/* Acciones específicas para Administrador + Conciliado */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-teal rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Acciones de Administrador - Propuesta Conciliada</h3>
              <p className="text-gray-600">Funciones específicas para gestionar propuestas conciliadas</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left group"
              onClick={() => alert('Ejecutando: Revisar Conciliación')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Revisar Conciliación</span>
              </div>
            </button>

            <button
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left group"
              onClick={() => alert('Ejecutando: Aprobar Proyección')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Aprobar Proyección</span>
              </div>
            </button>

            <button
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left group"
              onClick={() => alert('Ejecutando: Rechazar')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Rechazar</span>
              </div>
            </button>

            <button
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left group"
              onClick={() => alert('Ejecutando: Cambiar Estado')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Cambiar Estado</span>
              </div>
            </button>
          </div>
        </div>

        {/* Estado actual y próximos pasos */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Estado Actual y Próximos Pasos</h3>
              <p className="text-gray-600">Información sobre el flujo de trabajo</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Estado Actual: Conciliado</h4>
              <p className="text-blue-700 text-sm">
                La propuesta se encuentra en el estado "Conciliado" y está siendo gestionada por el Administrador.
                Como administrador, puede revisar la conciliación, aprobar la proyección, rechazarla o cambiar el estado.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Próximos Pasos</h4>
              <p className="text-green-700 text-sm">
                Utilice las acciones disponibles arriba para avanzar en el proceso de la propuesta. 
                Puede aprobar la proyección para que avance al estado "Proyectado" o rechazarla si no cumple con los requisitos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministradorConciliado;
