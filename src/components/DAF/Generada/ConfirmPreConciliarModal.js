import React, { useEffect } from 'react';

const ConfirmPreConciliarModal = ({ open, programasNoAperturar = [], alumnosEditados = [], onConfirm, onCancel }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onCancel?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
        <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 border border-red-200">
        
        <h2 className="text-2xl font-semibold text-center text-red-700 mb-4">
          ¿Estás seguro de que quieres preconciliar?
        </h2>

        {/* Ícono grande */}
        <div className="flex justify-center mb-4">
          <svg className="w-24 h-24 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 5c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
          </svg>
        </div>

        <p className="text-sm text-gray-700 text-center mb-4">
          <span className="font-semibold text-red-600">Recuerda</span>: no se podrá editar esto a futuro.
        </p>

        {/* Lista de programas No Aperturar */}
        {programasNoAperturar.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-800 mb-2">
              Programas marcados con “No aperturar”:
            </h3>
            <ul className="list-disc list-inside text-xs text-gray-800 space-y-1">
              {programasNoAperturar.map((p) => {
                // Calcular alumnos reales contando las oportunidades matriculadas o cerradas
                const matriculados = (p.oportunidades || []).filter(
                  o => o.etapa_venta_propuesto === '3 - Matrícula' || o.etapa_venta_propuesto === '4 - Cerrada/Ganada'
                ).length;
                const enRiesgo = matriculados < (p.punto_minimo_apertura || 0);
                
                return (
                  <li key={p.id}>
                    {p.nombre} –{" "}
                    <span className={enRiesgo ? "text-red-600 font-semibold" : "text-green-600 font-semibold"}>
                      {enRiesgo ? `En riesgo` : `Ok`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Lista de alumnos con montos editados */}
        {alumnosEditados && alumnosEditados.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-800 mb-2">
              Alumnos con montos editados por DAF:
            </h3>
            <div className="max-h-40 overflow-y-auto">
              <ul className="list-disc list-inside text-xs text-gray-800 space-y-1">
                {alumnosEditados.map((alumno) => (
                  <li key={alumno.dni || alumno.id}>
                    {alumno.nombre || `Alumno ${alumno.dni}`} – Programa: {alumno.nombrePrograma} – 
                    <span className="text-red-600 line-through mr-1">
                      ${(alumno.monto_inicial || alumno.monto || 0).toLocaleString()}
                    </span>
                    <span className="text-green-600 font-semibold">
                      ${(alumno.monto_propuesto || 0).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2 rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition
                       focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPreConciliarModal;
