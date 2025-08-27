import React from 'react';

const features = [
  { icon: '📋', title: 'Gestión de Propuestas', description: 'Creación y gestión con programación temporal' },
  { icon: '⚙️', title: 'Control de Estados', description: 'Flujos de trabajo y transiciones automáticas' },
  { icon: '👥', title: 'Sistema de Roles', description: 'Control de acceso y permisos granulares' },
  { icon: '🔍', title: 'Búsqueda Avanzada', description: 'Filtros y herramientas de búsqueda' },
  { icon: '📊', title: 'Reportes', description: 'Análisis y reportes detallados' },
  { icon: '🔄', title: 'Conciliaciones', description: 'Gestión integral de conciliaciones' },
];

const SystemInfo = () => {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        {features.map((f, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
            <div className="text-2xl">{f.icon}</div>
            <div>
              <h5 className="font-semibold text-gray-800 mb-1">{f.title}</h5>
              <p className="text-sm text-gray-600">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemInfo;
