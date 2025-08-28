import React, { useState, useMemo } from 'react';

const ProgramasGrillaDAFRevision = ({
  programas,
  expanded,
  onToggleExpand,
  onToggleCancelar,
  onChangeMonto,
  onRevertMonto,
}) => {
  const [selectedCarteras, setSelectedCarteras] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Lista única de carteras
  const todasCarteras = useMemo(() => {
    const set = new Set(programas.map(p => p.cartera));
    return Array.from(set);
  }, [programas]);

  // Filtrado por carteras seleccionadas
  const programasFiltrados = useMemo(() => {
    if (selectedCarteras.length === 0) return programas;
    return programas.filter(p => selectedCarteras.includes(p.cartera));
  }, [programas, selectedCarteras]);
  return (
    // Wrapper de página con mismo ancho/padding que el header
    <div className="mx-auto px-4 sm:px-6 lg:px-12">
      {/* Tarjeta */}
      <div className="bg-white  shadow-soft p-8 mb-8 border border-gray-200">

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] text-sm">
            <colgroup>
              <col style={{ width: '10%' }} />   {/* Cartera */}
              <col style={{ width: '20%' }} />   {/* Programa */}
              <col style={{ width: '8%' }} />    {/* Fecha */}
              <col style={{ width: '8%' }} />    {/* Meta Venta */}
              <col style={{ width: '8%' }} />    {/* Meta Alumnos */}
              <col style={{ width: '8%' }} />    {/* Alumnos Reales */}
              <col style={{ width: '10%' }} />   {/* Monto Real */}
            </colgroup>

            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="align-middle">
                <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider relative">
                  <div
                    onClick={() => setShowDropdown(prev => !prev)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    Cartera
                    <span className="ml-2 text-xs text-gray-500">▼</span>
                  </div>

                  {showDropdown && (
                    <div className="absolute z-20 mt-2 bg-white border rounded shadow-lg p-2 max-h-48 overflow-auto">
                      {todasCarteras.map(c => (
                        <label key={c} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={selectedCarteras.includes(c)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCarteras(prev => [...prev, c]);
                              } else {
                                setSelectedCarteras(prev => prev.filter(x => x !== c));
                              }
                            }}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          {c}
                        </label>
                      ))}
                      <button
                        onClick={() => setSelectedCarteras([])}
                        className="mt-2 w-full text-xs text-blue-600 hover:underline"
                      >
                        Limpiar filtro
                      </button>
                    </div>
                  )}
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">Programa</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Fecha<br/>Inauguración</th> {/* ← NUEVA */}

                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Meta<br/>Venta</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Meta<br/>Alumnos</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Alumnos<br/>Reales</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Monto<br/>Real</th>
              </tr>
            </thead>


            <tbody className="bg-white divide-y divide-gray-400">
              {programasFiltrados.map((programa) => {
                const matriculados = (programa.personas || []).filter(p => p.estado === 'matriculado');
                const enRiesgo = matriculados.length < (programa.minimo_apertura ?? 0);

                return (
                  <React.Fragment key={programa.id}>
                    <tr
                      className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => onToggleExpand(programa.id)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">{programa.cartera}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 leading-relaxed">{programa.nombre}</td>
                      {/* 🔹 Nueva columna */}
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {programa.fecha_inaguracion
                          ? new Date(programa.fecha_inaguracion).toLocaleDateString('es-PE')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">S/ {programa.meta_venta?.toLocaleString() || '0'}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{programa.meta_alumnos || '0'}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{programa.alumnos_reales || matriculados.length}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">S/ {programa.monto_real?.toLocaleString() || '0'}</td>
                      

                      
                    </tr>


                    {expanded[programa.id] && (
                      <tr>
                        <td colSpan={9} className="bg-purple-50 px-4 py-2">
                          <div className="overflow-x-auto mb-2">
                            <table className="min-w-max w-full text-xs">
                              <thead>
                                <tr>
                                  <th className="px-2 py-1 text-left">Identificador</th>
                                  <th className="px-2 py-1 text-left">Alumno</th>
                                  <th className="px-2 py-1 text-left">Monto</th>
                                  <th className="px-2 py-1 text-left">Monto Propuesto</th>
                                  <th className="px-2 py-1 text-left">Moneda</th>
                                  <th className="px-2 py-1 text-left">Fecha de Matrícula</th>
                                  <th className="px-2 py-1 text-left">Estado</th>
                                </tr>
                              </thead>
                              <tbody>
                                {matriculados.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="text-center text-gray-500 py-2">Sin matriculados</td>
                                  </tr>
                                ) : (
                                  matriculados.map((m) => (
                                    <tr
                                      key={m.identificador}
                                      className={
                                        m.agregadoEnSesion || m.monto_editado_en_sesion
                                          ? 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 transition-colors'
                                          : ''
                                      }
                                    >
                                      <td className="px-2 py-1 font-mono">{m.identificador}</td>
                                      <td className="px-2 py-1 text-xs">{m.alumno || 'N/A'}</td>
                                      <td className="px-2 py-1"><span>S/ {m.monto}</span></td>
                                      <td className="px-2 py-1">
                                        <input
                                          type="number"
                                          value={m.monto_propuesto || ''}
                                          onChange={(e) => onChangeMonto(programa.id, m.identificador, e.target.value)}
                                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
                                          placeholder="0"
                                        />
                                      </td>
                                      <td className="px-2 py-1">{m.moneda}</td>
                                      <td className="px-2 py-1">{m.fecha_estado}</td>
                                      <td className="px-2 py-1">
                                        {m.agregadoEnSesion && (
                                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                            Agregado en sesión
                                          </span>
                                        )}
                                        {m.monto_propuesto && m.monto_propuesto !== m.monto && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onRevertMonto(programa.id, m.identificador);
                                            }}
                                            className="ml-2 px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                          >
                                            Revertir
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramasGrillaDAFRevision;
