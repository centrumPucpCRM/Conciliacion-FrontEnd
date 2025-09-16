import React, { useMemo, useState } from 'react';
import { useRole } from '../../context/RoleContext';

const PropuestaResumen = ({ propuesta, formatearFecha, handleConfirmarCambios, todasAprobacionJPAbiertas, alumnosAgregados }) => {
  const { currentUser } = useRole();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Filtrar carteras de la propuesta para mostrar solo las del usuario actual
  const userCarterasNames = useMemo(() => {
    if (!currentUser?.carteras) return [];
    return currentUser.carteras.map(c => 
      typeof c === 'object' && c.nombre ? c.nombre : c
    );
  }, [currentUser]);
  
  const filteredCarteras = useMemo(() => {
    if (!propuesta?.carteras || !userCarterasNames.length) return propuesta?.carteras || [];
    return propuesta.carteras.filter(cartera => userCarterasNames.includes(cartera));
  }, [propuesta, userCarterasNames]);
  
  if (!propuesta) return null;

  // Depuración: ver qué llega como alumnosAgregados
  if (showConfirmModal) {
    console.log('alumnosAgregados en modal:', alumnosAgregados);
  }
  return (
    <>
      {/* Wrapper con mismo ancho/padding que el header */}
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        {/* Tarjeta */}
        <div className="mt-4 bg-white rounded-2xl shadow-soft p-4 mb-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end">
            {/* Nombre (20% en lg) */}
            <div className="space-y-2 lg:col-span-1">
              <label className="block text-2xl font-medium text-gray-700">Nombre</label>
              <label className="text-2xs text-gray-900">{propuesta.nombre}</label>
            </div>

            {/* Fecha de Propuesta (20% en lg) */}
            <div className="space-y-2 lg:col-span-1">
              <label className="block text-2xl font-medium text-gray-700">Fecha de Propuesta</label>
              <label className="text-2xs text-gray-900">
                {formatearFecha(propuesta.creado_en)}
              </label>
            </div>

            {/* Carteras (40% en lg, más espacio en md) */}
            <div className="space-y-2 md:col-span-2 lg:col-span-3">
              <label className="block text-2xl font-medium text-gray-700">Carteras</label>
              <label className="text-xs text-gray-900 break-words">
                {filteredCarteras.length > 0 
                  ? filteredCarteras.join(', ') 
                  : 'No hay carteras disponibles para su usuario'}
              </label>
            </div>
            {/* Botón Enviar Solicitud */}
            <div className="flex items-center justify-end lg:col-span-1 h-full">
              <button
                className={`px-8 py-3 text-base font-semibold rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 ${todasAprobacionJPAbiertas ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                style={{ minWidth: '170px', marginTop: 'auto', marginBottom: 'auto' }}
                onClick={todasAprobacionJPAbiertas ? () => setShowConfirmModal(true) : undefined}
                disabled={!todasAprobacionJPAbiertas}
              >
                {todasAprobacionJPAbiertas ? 'Enviar Solicitud' : '(Pendiente a Revisión)'}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 min-w-[320px] max-w-[90vw]">
            <h2 className="text-xl font-semibold mb-4">¿Está seguro de enviar la solicitud?</h2>
            {alumnosAgregados && alumnosAgregados.length > 0 ? (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">Alumnos agregados en sesión:</h3>
                <ul className="list-disc pl-6 text-sm text-gray-700">
                  {alumnosAgregados.map((al, idx) => (
                    <li key={idx}>
                      {al.alumno ? al.alumno : al.dni} {al.dni ? `(${al.dni})` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mb-4">
                <span className="text-sm text-gray-500">No hay alumnos agregados en sesión.</span>
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                onClick={() => setShowConfirmModal(false)}
              >Cancelar</button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={async () => {
                  setShowConfirmModal(false);
                  // Enviar solicitudes AGREGAR_ALUMNO al backend
                  if (alumnosAgregados && alumnosAgregados.length > 0) {
                    for (const alumno of alumnosAgregados) {
                      const payload = {
                        id_propuesta: propuesta.id_propuesta || propuesta.id,
                        id_propuesta_oportunidad: alumno.id_propuesta_oportunidad,
                        id_usuario_generador: currentUser.id_usuario,
                        id_usuario_receptor: 1, // Cambia si tienes lógica para receptor
                        comentario: `Solicitud de agregar alumno ${alumno.alumno} (${alumno.dni})`,
                        etapa_venta_propuesto: alumno.etapa_venta_propuesto || "3.5 - Tentativa Matricula"
                      };
                      try {
                        await fetch("http://localhost:8000/solicitudes-pre-conciliacion/agregar-alumno", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload)
                        });
                      } catch (err) {
                        console.error("Error creando solicitud AGREGAR_ALUMNO:", err);
                      }
                    }
                  }
                  handleConfirmarCambios();
                }}
              >Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropuestaResumen;
