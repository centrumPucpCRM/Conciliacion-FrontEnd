import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha, obtenerColorEstado } from '../../utils/mockData';

const SubdirectorProyectado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();

  const propuesta = {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'proyectado',
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
              <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Proyección</h1>
                <p className="text-gray-600 text-sm">Como Subdirector, debe gestionar la propuesta proyectada</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                Proyectado
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
              <p className="text-sm text-gray-900">Subdirector</p>
            </div>
          </div>
        </div>

        {/* Acciones específicas para Subdirector + Proyectado */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Acciones de Subdirector - Propuesta Proyectada</h3>
              <p className="text-gray-600">Funciones específicas para gestión de proyección</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left group"
              onClick={() => alert('Ejecutando: Revisar Proyección')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Revisar Proyección</span>
              </div>
            </button>

            <button
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left group"
              onClick={() => alert('Ejecutando: Finalizar Proceso')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Finalizar Proceso</span>
              </div>
            </button>

            <button
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left group"
              onClick={() => alert('Ejecutando: Generar Reporte')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Generar Reporte</span>
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
              <h4 className="font-semibold text-blue-800 mb-2">Estado Actual: Proyectado</h4>
              <p className="text-blue-700 text-sm">
                La propuesta se encuentra en el estado "Proyectado" y está siendo gestionada por el Subdirector.
                Como Subdirector, debe revisar la proyección final, finalizar el proceso o generar reportes según sea necesario.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Próximos Pasos</h4>
              <p className="text-green-700 text-sm">
                Utilice las acciones disponibles arriba para gestionar la proyección. 
                Puede revisar los detalles finales, finalizar el proceso completo o generar reportes para documentación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubdirectorProyectado;
