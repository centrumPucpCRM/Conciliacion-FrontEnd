import React from "react";

const tabs = [
  { id: "abiertas", label: "Abiertas" },
  { id: "conciliadas", label: "Conciliadas" },
  { id: "canceladas", label: "Canceladas" },
];

const PropuestasTabsPrincipal = ({ activeTab, onTabChange }) => {
  return (
    <div className="px-8 mt-3">
      <div className="border border-slate-200 rounded-full bg-white/70 px-2 py-2 shadow-sm backdrop-blur flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none ${
                isActive ? "bg-blue-500 text-white" : "text-slate-600 hover:bg-slate-100"
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

export default PropuestasTabsPrincipal;
