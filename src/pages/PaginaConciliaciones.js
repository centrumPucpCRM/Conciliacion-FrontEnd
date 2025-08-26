import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generarConciliacionesPrueba, formatearFecha } from '../utils/mockData';

const PaginaConciliaciones = () => {
  const navigate = useNavigate();
  const [conciliaciones, setConciliaciones] = useState([]);

  // Cargar datos de prueba al montar el componente
  useEffect(() => {
    const datosPrueba = generarConciliacionesPrueba();
    setConciliaciones(datosPrueba);
  }, []);

  const handleEntrarConciliacion = (conciliacion) => {
    alert(`Navegando a conciliación ${conciliacion.nombre}`);
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
                onClick={() => navigate('/main')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Volver al Inicio</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-indigo rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Conciliaciones</h1>
                <p className="text-gray-600 text-sm">Administre todas las conciliaciones del sistema</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Información del módulo */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Módulo de Conciliaciones</h3>
              <p className="text-gray-600 text-sm">Funcionalidad en desarrollo</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Información del Sistema</h4>
                <p className="text-blue-800 mb-3">
                  Este módulo permite gestionar las conciliaciones del sistema con herramientas 
                  avanzadas de análisis y reportes detallados.
                </p>
                <p className="text-blue-700 text-sm italic">
                  Nota: Esta funcionalidad está en desarrollo y se implementará en futuras versiones.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Grilla de Conciliaciones */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-indigo rounded-xl flex items-center justify-center shadow-medium">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Conciliaciones</h3>
                  <p className="text-gray-600 text-sm">{conciliaciones.length} conciliaciones encontradas</p>
                </div>
              </div>
            </div>
          </div>
          
          {conciliaciones.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No se encontraron conciliaciones</h4>
              <p className="text-gray-500">No hay datos disponibles en este momento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre de Conciliación
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Conciliación
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Propuestas Asociadas
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Creación
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conciliaciones.map(conciliacion => (
                    <tr key={conciliacion.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{conciliacion.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatearFecha(conciliacion.fecha_conciliacion)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {conciliacion.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{conciliacion.propuestas_asociadas}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatearFecha(conciliacion.fecha_creacion)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 text-xs font-medium"
                            onClick={() => handleEntrarConciliacion(conciliacion)}
                          >
                            Entrar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaginaConciliaciones;
