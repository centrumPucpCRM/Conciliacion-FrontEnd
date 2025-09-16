import React, { useState, useEffect } from 'react';

const campos = [
  { key: 'dni', label: 'Dni' },
  { key: 'alumno', label: 'Alumno' },
  { key: 'monto', label: 'Monto' },
  { key: 'etapa_venta_propuesto', label: 'Etapa' },
  { key: 'descuento', label: 'Descuento' },
  { key: 'moneda', label: 'Moneda' }
];

const AlumnosModal = ({ open, alumnos, onClose, search, onAgregarAlumno }) => {
  const [localSearch, setLocalSearch] = useState(search);
  useEffect(() => { setLocalSearch(search); }, [search, open]);
  if (!open) return null; // Aseguramos que el modal se cierre correctamente
  // Solo mostrar no matriculados
  const alumnosFiltrados = alumnos.filter(a =>
    a.etapa_venta_propuesto !== '3 - Matrícula' &&
    a.etapa_venta_propuesto !== '3.5 - Tentativa Matricula' &&
    a.etapa_venta_propuesto !== '4 - Cerrada/Ganada'
  ).filter(a => {
    const val = localSearch.trim().toLowerCase();
    if (!val) return true;
    return (String(a.dni).toLowerCase().includes(val) || String(a.alumno).toLowerCase().includes(val));
});
  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl" style={{maxHeight: '80vh'}}>
        <h2 className="text-lg font-bold mb-4 text-center">Agregar alumnos (no matriculados)</h2>
        <input
          type="text"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          placeholder="Buscar por DNI o nombre"
          className="mb-4 w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
        />
        <div className="overflow-y-auto" style={{maxHeight: '55vh'}}>
          <table className="w-full text-xs mb-4">
            <thead>
              <tr>
                {campos.map((campo) => (
                  <th key={campo.key} className="px-2 py-1 border-b text-left">{campo.label}</th>
                ))}
                <th className="px-2 py-1 border-b text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {alumnosFiltrados.map((alumno, idx) => (
                <tr key={idx}>
                  {campos.map((campo) => (
                    <td key={campo.key} className="px-2 py-1 border-b">{String(alumno[campo.key] ?? '')}</td>
                  ))}
                  <td className="px-2 py-1 border-b text-center">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                      onClick={() => onAgregarAlumno && typeof onAgregarAlumno === 'function' && onAgregarAlumno(alumno)}
                    >Agregar</button>
                  </td>
                </tr>
              ))}
              {alumnosFiltrados.length === 0 && (
                <tr><td colSpan={campos.length+1} className="text-center py-4 text-gray-400">No se encontraron alumnos</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default AlumnosModal;
