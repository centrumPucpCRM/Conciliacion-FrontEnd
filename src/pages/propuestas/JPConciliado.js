import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha, obtenerColorEstado } from '../../utils/mockData';

const JPConciliado = () => {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Validación de Conciliación</h1>
                <p className="text-gray-600 text-sm">Como JP, debe validar la conciliación realizada</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
              <p className="text-sm text-gray-900">JP</p>
            </div>
          </div>
        </div>

        {/* Acciones específicas para JP + Conciliado */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-teal rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Acciones de JP - Propuesta Conciliada</h3>
              <p className="text-gray-600">Funciones específicas para validar la conciliación</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left group"
              onClick={() => alert('Ejecutando: Validar Conciliación')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Validar Conciliación</span>
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
              onClick={() => alert('Ejecutando: Solicitar Revisión')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:shadow-medium transition-shadow duration-200">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-gray-800">Solicitar Revisión</span>
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
                La propuesta se encuentra en el estado "Conciliado" y está siendo validada por el JP.
                Como JP, debe validar la conciliación realizada, aprobar la proyección o solicitar revisiones.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Próximos Pasos</h4>
              <p className="text-green-700 text-sm">
                Utilice las acciones disponibles arriba para avanzar en el proceso de validación. 
                Puede aprobar la proyección para que avance al estado "Proyectado" o solicitar revisiones si es necesario.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JPConciliado;
