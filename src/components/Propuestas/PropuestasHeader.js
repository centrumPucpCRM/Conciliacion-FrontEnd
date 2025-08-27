import React from 'react';
import RoleSwitch from '../RoleSwitch';

const PropuestasHeader = ({ onBack,titulo, showRoleSwitch = true }) => {
  return (
    <header className="w-full bg-gray-800 text-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-12 py-3
                      grid items-center gap-3
                      [grid-template-columns:1fr_auto_1fr]">
        {/* Izquierda */}
        <div className="justify-self-start">
          <button
            className="flex items-center gap-2 px-5 py-2 bg-white/10 border border-white/20 rounded-xl shadow
                       hover:bg-white/20 transition font-semibold"
            onClick={onBack}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver al inicio</span>
          </button>
        </div>

        {/* Centro (siempre queda centrado) */}
        <h1 className="justify-self-center text-center font-bold tracking-wider text-2xl sm:text-3xl md:text-4xl capitalize">
          {titulo}
        </h1>

        {/* Derecha */}
        <div className="justify-self-end">
          {showRoleSwitch && (
            <div className="bg-white text-gray-800 rounded-xl px-3 py-1 shadow">
              <RoleSwitch />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PropuestasHeader;
