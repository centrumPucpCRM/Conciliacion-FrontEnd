import React from 'react';

const tabs = [
  { id: 'mesConciliado', label: 'Conciliación' },
  { id: 'mesesPasados', label: 'Revisión' }
];

const PropuestasTabsDaf = ({ activeTab, onTabChange }) => {
  return (
    <div className="px-12 mt-4">
      <div className="inline-flex  bg-white shadow-sm overflow-hidden border border-gray-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-6 py-2 text-lg font-medium transition-colors focus:outline-none
                ${isActive
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PropuestasTabsDaf;
