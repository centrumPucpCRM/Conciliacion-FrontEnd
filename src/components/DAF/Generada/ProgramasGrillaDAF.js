import React, { useState, useMemo, useEffect } from 'react';

const ProgramasGrillaDAF = ({
  programas,
  expanded,
  onToggleExpand,
  onToggleCancelar,
  onChangeMonto,
  onRevertMonto,
  selectedCarteras,
  setSelectedCarteras,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  // Estado local para programas y alumnos con monto_real calculado
  const [localProgramas, setLocalProgramas] = useState([]);

  // Inicializar y actualizar localProgramas con monto_real calculado al cambiar programas
  useEffect(() => {
    if (localProgramas.length === 0) {
    // Siempre sincronizamos con los props, pero mantenemos la lógica de cálculo de monto_real
    const progs = (programas || []).map((p) => {
      const oportunidades = (p.oportunidades || []).map((o) => ({ ...o }));
      const monto_real = oportunidades.reduce(
        (acc, o) => {
          if (o.monto_propuesto_daf !== undefined && o.monto_propuesto_daf !== null && o.monto_propuesto_daf !== '') {
            return acc + Number(o.monto_propuesto_daf);
          } else if (o.monto_propuesto !== undefined && o.monto_propuesto !== null && o.monto_propuesto !== '') {
            return acc + Number(o.monto_propuesto);
          } else {
            return acc + (Number(o.monto) || 0);
          }
        },
        0
      );
      return { ...p, oportunidades, monto_real };
    });
    setLocalProgramas(progs);
    }
    // Ahora actualizamos localProgramas cada vez que cambian los programas del padre
    // Esto asegura que los cambios del estado global se reflejen en el estado local
  }, [programas]);

  // Handler para editar monto propuesto de un alumno
  const handleChangeMonto = (programaId, dni, value) => {
    // Actualizar estado local para UI inmediata
    setLocalProgramas((prev) =>
      prev.map((prog) => {
        if (prog.id !== programaId) return prog;
        const oportunidades = prog.oportunidades.map((o) => {
          if (o.dni !== dni) return o;
          // Solo se edita monto_propuesto_daf
          if (value === '' || value === null) {
            const { monto_propuesto_daf, ...rest } = o;
            return { ...rest, monto_editado_en_sesion: false };
          }
          return { ...o, monto_propuesto_daf: Number(value), monto_editado_en_sesion: true };
        });
        const monto_real = oportunidades.reduce(
          (acc, o) => {
            if (o.monto_propuesto_daf !== undefined && o.monto_propuesto_daf !== null && o.monto_propuesto_daf !== '') {
              return acc + Number(o.monto_propuesto_daf);
            } else if (o.monto_propuesto !== undefined && o.monto_propuesto !== null && o.monto_propuesto !== '') {
              return acc + Number(o.monto_propuesto);
            } else {
              return acc + (Number(o.monto) || 0);
            }
          },
          0
        );
        return { ...prog, oportunidades, monto_real };
      })
    );

    // Propagamos el cambio al componente padre para actualizar el estado global
    if (onChangeMonto) {
      onChangeMonto(programaId, dni, value === '' || value === null ? null : Number(value));
    }
  };

  // Handler para revertir monto propuesto
  const handleRevertMonto = (programaId, dni) => {
    setLocalProgramas((prev) =>
      prev.map((prog) => {
        if (prog.id !== programaId) return prog;
        const oportunidades = prog.oportunidades.map((o) => {
          if (o.dni !== dni) return o;
          // Eliminar monto_propuesto_daf para volver a mostrar monto_propuesto
          const { monto_propuesto_daf, ...rest } = o;
          return { ...rest, monto_editado_en_sesion: false };
        });
        const monto_real = oportunidades.reduce(
          (acc, o) => {
            if (o.monto_propuesto_daf !== undefined && o.monto_propuesto_daf !== null && o.monto_propuesto_daf !== '') {
              return acc + Number(o.monto_propuesto_daf);
            } else if (o.monto_propuesto !== undefined && o.monto_propuesto !== null && o.monto_propuesto !== '') {
              return acc + Number(o.monto_propuesto);
            } else {
              return acc + (Number(o.monto) || 0);
            }
          },
          0
        );
        return { ...prog, oportunidades, monto_real };
      })
    );

    // Propagamos el revertido al componente padre para actualizar el estado global
    if (onRevertMonto) {
      onRevertMonto(programaId, dni);
    }
  };

  // Handler para manejar los cambios en el checkbox de No Aperturar
  const handleCancelarChange = (programaId) => {
    // Actualizar el estado local para UI inmediata
    setLocalProgramas((prev) => {
      const updated = prev.map((prog) => {
        if (String(prog.id) !== String(programaId)) return prog;        
        return {
          ...prog,
          cancelar: !prog.cancelar
        };
      });
      return updated;
    });

    // Llamar al handler del componente padre para actualizar el estado global
    if (onToggleCancelar) {
      onToggleCancelar(programaId);
    }
  };

  // Lista única de carteras
  // Estados y funciones de filtro de mes han sido eliminados

  const todasCarteras = useMemo(() => {
    const set = new Set(localProgramas.map(p => p.cartera));
    return Array.from(set);
  }, [localProgramas]);

  // La lista de meses ha sido eliminada

  // Filtrado solo por carteras seleccionadas
  const programasFiltrados = useMemo(() => {
    let filtrados = localProgramas;
    
    // Filtro por cartera
    if (selectedCarteras.length > 0) {
      filtrados = filtrados.filter(p => selectedCarteras.includes(p.cartera));
    }
    
    return filtrados;
    }, [localProgramas]);
  return (
    // Wrapper de página con mismo ancho/padding que el header
  <div className="mx-auto px-4 sm:px-6 lg:px-12">
  <div className="bg-white shadow-soft p-8 mb-8 border border-gray-20 min-h-full w-full" style={{minHeight: '100%', width: '100%'}}>

        <div>
          <table className="w-full text-sm align-top">
            <colgroup>
              <col style={{ width: '1%' }}/>
              <col style={{ width: '20%' }}/>
              <col style={{ width: '1%' }}/>
              <col style={{ width: '5%' }}/>
              <col style={{ width: '1%' }}/>
              <col style={{ width: '1%' }}/>
              <col style={{ width: '5%' }}/>
              <col style={{ width: '1%' }}/>
              <col style={{ width: '1%' }}/>
              <col style={{ width: '1%' }}/>
            </colgroup>

            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="align-middle">
                <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider relative">
                  <div
                    onClick={() => setShowDropdown(prev => !prev)}
                    className="cursor-pointer flex items-center justify-between">
                    Cartera
                    <span className="ml-2 text-xs text-gray-500">▼</span>
                  </div>

                  {showDropdown && (
                    <div className="absolute z-20 mt-2 bg-white border rounded shadow-lg p-2 max-h-96  w-64 flex flex-col">
                      <button
                        onClick={() => setSelectedCarteras([])}
                        className="mb-2 w-full text-xs text-blue-600 hover:underline"
                      >
                        Limpiar filtro
                      </button>
                      <div className="overflow-auto">
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
                      </div>
                    </div>
                  )}
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">Programa</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Fecha<br/>Inauguración</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 capitalize tracking-wider">Meta<br/>Venta</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 capitalize tracking-wider">Meta<br/>Alumnos</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 capitalize tracking-wider">Alumnos<br/>Reales</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 capitalize tracking-wider">Monto<br/>Real</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 capitalize tracking-wider">Punto mínimo<br/>de apertura</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider whitespace-nowrap">En riesgo</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">No Aperturar<br/>(DAF)</th>
              </tr>
            </thead>


            <tbody className="bg-white divide-y divide-gray-400  align-top">
              {programasFiltrados.map((programa, idx) => {
                const matriculados = (programa.oportunidades || []).filter(p => p.etapa_venta_propuesto === '3 - Matrícula' || p.etapa_venta_propuesto === '4 - Cerrada/Ganada');

                const enRiesgo = matriculados.length < (programa.punto_minimo_apertura ?? 0);
                const tieneAtipicoMatriculado = matriculados.some(o => o.posible_atipico);

                // Usar id_programa si existe, si no, fallback a idx
                const programaKey = programa.id_programa || programa.id || idx;
                return (
                  <React.Fragment key={programaKey}>
                    <tr
                      className={`transition-colors duration-200 ${tieneAtipicoMatriculado ? 'bg-yellow-100 hover:bg-yellow-200' : 'hover:bg-blue-50'}`}
                    >
                      {/* Celdas de datos con clic para expandir */}
                      <td 
                        className="px-4 py-3 text-sm text-gray-700 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.cartera}
                      </td>
                      <td 
                        className="px-4 py-3 text-sm text-gray-900 leading-relaxed cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.nombre}
                      </td>
                      {/* Columna Fecha de Inauguración */}
                      <td 
                        className="px-4 py-3 text-center text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.fecha_de_inauguracion
                          ? new Date(programa.fecha_de_inauguracion).toLocaleDateString('es-PE')
                          : '—'}
                      </td>
                      <td 
                        className="px-4 py-3 text-right text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        S/ {programa.meta_venta?.toLocaleString() || '0'}
                      </td>
                      <td 
                        className="px-4 py-3 text-right text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.meta_alumnos || '0'}
                      </td>
                      <td 
                        className="px-4 py-3 text-right text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.alumnos_reales || matriculados.length}
                      </td>
                      <td 
                        className="px-4 py-3 text-right text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        S/ {programa.monto_real?.toLocaleString() || '0'}
                      </td>
                      <td 
                        className="px-4 py-3 text-right text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.punto_minimo_apertura}
                      </td>
                      <td 
                        className="px-4 py-3 text-center cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          enRiesgo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {enRiesgo ? 'En riesgo' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!programa.cancelar}
                          onChange={(e) => {
                            // Pasamos el ID exacto del programa
                            const programaId = programa.id || programa.id_programa || programaKey;
                            handleCancelarChange(programaId);
                            onToggleCancelar(programa.id);
                          }}
                          className="form-checkbox h-5 w-5 text-accent-orange focus:ring-accent-orange border-gray-300 rounded"
                        />
                      </td>
                    </tr>

                    {expanded[programa.id] && (
                      <tr>
                        <td colSpan={10} className="bg-purple-50 px-4 py-2">
                          <div className="overflow-x-auto mb-2">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="px-2 py-1 text-left">Identificador</th>
                                  <th className="px-2 py-1 text-left">Alumno</th>
                                  <th className="px-2 py-1 text-left">Descuento</th>
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
                                    <td colSpan={8} className="text-center text-gray-500 py-2">Sin matriculados</td>
                                  </tr>
                                ) : (
                                  matriculados.map((m, mIdx) => (
                                    <tr
                                      key={m.identificador || mIdx}
                                      className={
                                        (() => {
                                          const base = 'transition-colors';
                                          const edited = m.monto_propuesto_daf !== undefined && m.monto_propuesto_daf !== null;
                                          let original = m.monto_propuesto !== undefined && m.monto_propuesto !== null ? m.monto_propuesto : m.monto;
                                          if (
                                            m.agregadoEnSesion ||
                                            (edited && Number(m.monto_propuesto_daf) !== Number(original))
                                          ) {
                                            return 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 ' + base;
                                          }
                                          return base;
                                        })()
                                      }
                                    >
                                      <td className="px-2 py-1 font-mono">{m.dni}</td>
                                      <td className="px-2 py-1 text-xs">{m.alumno || 'N/A'}</td>
                                      <td className="px-2 py-1">{m.descuento ? `${(Number(m.descuento) * 100).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%` : '-'}</td>
                                      <td className="px-2 py-1"><span>S/ {m.monto}</span></td>
                                      <td className="px-2 py-1">
                                        <input
                                          type="number"
                                          value={m.monto_propuesto_daf !== undefined && m.monto_propuesto_daf !== null ? m.monto_propuesto_daf : (m.monto_propuesto !== undefined && m.monto_propuesto !== null ? m.monto_propuesto : '')}
                                          onChange={(e) => handleChangeMonto(programa.id, m.dni, e.target.value)}
                                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
                                          placeholder="0"
                                        />
                                      </td>
                                      <td className="px-2 py-1">{m.moneda}</td>
                                      <td className="px-2 py-1">{m.fecha_matricula}</td>
                                      <td className="px-2 py-1 flex gap-1 flex-wrap">
                                        {m.agregadoEnSesion && (
                                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                            Agregado en sesión
                                          </span>
                                        )}
                                        {m.monto_propuesto_daf !== undefined && m.monto_propuesto_daf !== null && m.monto_propuesto_daf !== m.monto_propuesto && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleRevertMonto(programa.id, m.dni);
                                            }}
                                            className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                          >
                                            Revertir
                                          </button>
                                        )}
                                        {m.posible_atipico && (m.etapa_venta_propuesto === '3 - Matrícula' || m.etapa_venta_propuesto === '4 - Cerrada/Ganada') && (
                                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                            Atípico
                                          </span>
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
            <tfoot className="bg-gray-200 font-semibold border-t-2 border-gray-400">
              <tr>
                <td className="px-4 py-3 text-right" colSpan={3}>Totales:</td> {/* Cartera + Programa + Fecha */}
                <td className="px-4 py-3 text-right">
                  S/ {Math.round(programasFiltrados.reduce((sum, prog) => sum + (prog.meta_venta || 0), 0)).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {Math.round(programasFiltrados.reduce((sum, prog) => sum + (prog.meta_alumnos || 0), 0))}
                </td>
                <td className="px-4 py-3 text-right">
                  {Math.round(programasFiltrados.reduce((sum, prog) => {
                    const matriculados = (prog.oportunidades || []).filter(
                      p => p.etapa_venta_propuesto === '3 - Matrícula' || p.etapa_venta_propuesto === '4 - Cerrada/Ganada'
                    );
                    return sum + (prog.alumnos_reales || matriculados.length);
                  }, 0))}
                </td>
                <td className="px-4 py-3 text-right">
                  S/ {Math.round(programasFiltrados.reduce((sum, prog) => sum + (prog.monto_real || 0), 0)).toLocaleString()}
                </td>
                <td className="px-4 py-3"></td> {/* Punto mínimo apertura */}
                <td className="px-4 py-3"></td> {/* En riesgo */}
                <td className="px-4 py-3"></td> {/* No Aperturar (DAF) */}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramasGrillaDAF;