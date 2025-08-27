import React from 'react';

const HomeModules = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Módulo Propuestas */}
      <div className="group cursor-pointer" onClick={() => onNavigate('/main/propuestas')}>
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 transition-all duration-300
                        group-hover:shadow-medium group-hover:border-primary-200 group-hover:transform group-hover:scale-[1.02]">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-teal rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-large transition-shadow duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                Propuestas
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Inicie, programe y gestione propuestas de conciliación.
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
      <div className="group cursor-pointer" onClick={() => onNavigate('/main/conciliaciones')}>
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100 transition-all duration-300
                        group-hover:shadow-medium group-hover:border-primary-200 group-hover:transform group-hover:scale-[1.02]">
          <div className="flex items-start space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-indigo rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-large transition-shadow duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-primary-600 transition-colors duration-300">
                Conciliaciones
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Administre las propuestas conciliadas y la proyeccion de venta
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
  );
};

export default HomeModules;
