import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaginaPrincipal = () => {
  const navigate = useNavigate();

  const handleNavigation = (ruta) => {
    navigate(ruta);
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      {/* Header con patrón de fondo */}
      <div className="relative bg-white shadow-soft">
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sistema de Conciliación</h1>
                <p className="text-gray-600 text-sm">Centrum PUCP</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-indigo rounded-full flex items-center justify-center text-white font-semibold text-sm">
                TI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Saludo */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {getCurrentTime()}, Tecnologías Información
          </h2>
          <p className="text-gray-600 text-lg">
            Seleccione el módulo que desea gestionar
          </p>
        </div>

        {/* Navegación principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Módulo Propuestas */}
          <div className="group cursor-pointer" onClick={() => handleNavigation('/main/propuestas')}>
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 transition-all duration-300 group-hover:shadow-medium group-hover:border-primary-200 group-hover:transform group-hover:scale-[1.02]">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-teal rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-large transition-shadow duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                    Propuestas
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Gestione todas las propuestas del sistema con control de estados, 
                    programación temporal y flujos de trabajo avanzados.
                  </p>
                  <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 transition-colors duration-300">
                    <span>Acceder al módulo</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo Conciliaciones */}
          <div className="group cursor-pointer" onClick={() => handleNavigation('/main/conciliaciones')}>
            <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 transition-all duration-300 group-hover:shadow-medium group-hover:border-primary-200 group-hover:transform group-hover:scale-[1.02]">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-indigo rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-large transition-shadow duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                    Conciliaciones
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Administre las conciliaciones del sistema con herramientas 
                    avanzadas de análisis y reportes detallados.
                  </p>
                  <div className="flex items-center text-primary-600 font-medium group-hover:text-primary-700 transition-colors duration-300">
                    <span>Acceder al módulo</span>
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Información del Sistema</h3>
          </div>
          
          <p className="text-gray-700 mb-8 text-lg leading-relaxed">
            Este sistema permite gestionar propuestas y conciliaciones con control de acceso basado en roles, 
            proporcionando una plataforma integral para la gestión de procesos empresariales.
          </p>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-6">Funcionalidades principales</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📋',
                title: 'Gestión de Propuestas',
                description: 'Creación y gestión con programación temporal'
              },
              {
                icon: '⚙️',
                title: 'Control de Estados',
                description: 'Flujos de trabajo y transiciones automáticas'
              },
              {
                icon: '👥',
                title: 'Sistema de Roles',
                description: 'Control de acceso y permisos granulares'
              },
              {
                icon: '🔍',
                title: 'Búsqueda Avanzada',
                description: 'Filtros y herramientas de búsqueda'
              },
              {
                icon: '📊',
                title: 'Reportes',
                description: 'Análisis y reportes detallados'
              },
              {
                icon: '🔄',
                title: 'Conciliaciones',
                description: 'Gestión integral de conciliaciones'
              }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h5 className="font-semibold text-gray-800 mb-1">{feature.title}</h5>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaPrincipal;
