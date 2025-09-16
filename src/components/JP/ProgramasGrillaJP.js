import React, { useState, useMemo, useEffect } from 'react';
import AlumnosModal from '../common/AlumnosModal';

const ProgramasGrillaJP = ({
  programas,
  expanded,
  onToggleExpand,
  onToggleCancelar,
  onChangeMonto,
  onRevertMonto,
  selectedCarteras,
  setSelectedCarteras,
  onUpdateProgramas,
  gridId,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = React.useRef(null);

  // Cierra el dropdown cuando se hace clic fuera de él
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Estado local para programas y alumnos con monto_real calculado
  const [localProgramas, setLocalProgramas] = useState([]);
  const [showAlumnosModal, setShowAlumnosModal] = useState(false);
  const [alumnosModalData, setAlumnosModalData] = useState([]);
  const [alumnosModalSearch, setAlumnosModalSearch] = useState('');
  // Estado para alumnos agregados por programa
  const [alumnosAgregadosPorPrograma, setAlumnosAgregadosPorPrograma] = useState({}); // { [programaId]: [dni, ...] }

  // Inicializar localProgramas con monto_real calculado al cargar programas (solo si está vacío)
  useEffect(() => {
    if (localProgramas.length === 0) {
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
    // No actualizamos localProgramas si ya tiene datos, para preservar cambios locales
  }, [programas, localProgramas.length]);

  // Handler para editar monto propuesto de un alumno
  const handleChangeMonto = (programaId, dni, value) => {
    // Actualizar estado local para UI inmediata
    setLocalProgramas((prev) => {
      const updated = prev.map((prog) => {
        if (prog.id !== programaId) return prog;
        const oportunidades = prog.oportunidades.map((o) => {
          if (o.dni !== dni) return o;
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
      });
  if (onUpdateProgramas) onUpdateProgramas(gridId, updated);
      return updated;
    });
    if (onChangeMonto) {
      onChangeMonto(programaId, dni, value === '' || value === null ? null : Number(value));
    }
  };

  // Handler para revertir monto propuesto
  const handleRevertMonto = (programaId, dni) => {
    setLocalProgramas((prev) => {
      const updated = prev.map((prog) => {
        if (prog.id !== programaId) return prog;
        const oportunidades = prog.oportunidades.map((o) => {
          if (o.dni !== dni) return o;
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
      });
  if (onUpdateProgramas) onUpdateProgramas(gridId, updated);
      return updated;
    });
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
    if (selectedCarteras && selectedCarteras.length > 0) {
      filtrados = filtrados.filter(p => selectedCarteras.includes(p.cartera));
    }
    
    return filtrados;
  }, [localProgramas, selectedCarteras]);
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
              <col style={{ width: '5%' }}/>
              <col style={{ width: '1%' }}/>
              <col style={{ width: '1%' }}/>
              <col style={{ width: '1%' }}/>
            </colgroup>

            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="align-middle">
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider relative">
                  <div
                    onClick={() => setShowDropdown(prev => !prev)}
                    className="cursor-pointer flex items-center justify-between">
                    Cartera
                    <span className="ml-2 text-xs text-gray-500">▼</span>
                  </div>

                  {showDropdown && (
                    <div ref={dropdownRef} className="absolute z-20 mt-2 bg-white border rounded shadow-lg p-2 max-h-96  w-64 flex flex-col">
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
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Meta<br/>Venta</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Meta<br/>Alumnos</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Alumnos<br/>Reales</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Monto<br/>Real</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Punto mínimo<br/>de apertura</th>
                {/* Eliminado: En riesgo y No Aperturar (DAF) */}
              </tr>
            </thead>


            <tbody className="bg-white divide-y divide-gray-400  align-top">
              {programasFiltrados.map((programa, idx) => {
                const matriculados = (programa.oportunidades || []).filter(p => p.etapa_venta_propuesto === '3 - Matrícula' || p.etapa_venta_propuesto === '3.5 - Tentativa Matricula' || p.etapa_venta_propuesto === '4 - Cerrada/Ganada');

                const enRiesgo = matriculados.length < (programa.punto_minimo_apertura ?? 0);
                const tieneAtipicoMatriculado = matriculados.some(o => o.posible_atipico);

                // Usar id_programa si existe, si no, fallback a idx
                return (
                  <React.Fragment key={programa.id_programa}>
                    <tr
                      className={`transition-colors duration-200 ${tieneAtipicoMatriculado ? 'bg-yellow-100 hover:bg-yellow-200' : 'hover:bg-blue-50'}`}
                    >
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
                        {programa.meta_venta?.toLocaleString() || '0'}
                      </td>
                      <td 
                        className="px-4 py-3 text-center text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.meta_alumnos || '0'}
                      </td>
                      <td 
                        className="px-4 py-3 text-center text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.alumnos_reales || matriculados.length}
                      </td>
                      <td 
                        className="px-4 py-3 text-right text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.monto_real?.toLocaleString() || '0'}
                      </td>
                      <td 
                        className="px-4 py-3 text-center text-sm text-gray-900 cursor-pointer" 
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {programa.punto_minimo_apertura}
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
                                  <>
                                    {matriculados.map((m, mIdx) => {
                                      // Sincronización lógica de agregados y botón Eliminar
                                      const isAgregado = (alumnosAgregadosPorPrograma[programa.id] || []).includes(m.dni);
                                      const edited = m.monto_propuesto_daf !== undefined && m.monto_propuesto_daf !== null;
                                      let original = m.monto_propuesto !== undefined && m.monto_propuesto !== null ? m.monto_propuesto : m.monto;
                                      return (
                                        <tr
                                          key={mIdx}
                                          className={
                                            isAgregado
                                              ? 'bg-yellow-300 text-gray-900'
                                              : m.EnSolicitud
                                                ? 'bg-yellow-200 text-gray-900'
                                                : ((() => {
                                                    const base = 'transition-colors';
                                                    if (
                                                      m.agregadoEnSesion ||
                                                      (edited && Number(m.monto_propuesto_daf) !== Number(original))
                                                    ) {
                                                      return 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 ' + base;
                                                    }
                                                    return base;
                                                  })())
                                          }
                                        >
                                          <td className="px-2 py-1 font-mono">{m.dni}</td>
                                          <td className="px-2 py-1 text-xs">{m.alumno || 'N/A'}</td>
                                          <td className="px-2 py-1">{m.descuento ? `${(Number(m.descuento) * 100).toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%` : '-'}</td>
                                          <td className="px-2 py-1"><span>{m.monto}</span></td>
                                          <td className="px-2 py-1">
                                            {m.EnSolicitud ? (
                                              <span className="text-gray-600">{m.monto_propuesto || m.monto}</span>
                                            ) : (
                                              <input
                                                type="number"
                                                value={m.monto_propuesto_daf !== undefined && m.monto_propuesto_daf !== null ? m.monto_propuesto_daf : (m.monto_propuesto !== undefined && m.monto_propuesto !== null ? m.monto_propuesto : '')}
                                                onChange={(e) => handleChangeMonto(programa.id, m.dni, e.target.value)}
                                                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
                                                placeholder="0"
                                                disabled={m.EnSolicitud}
                                              />
                                            )}
                                          </td>
                                          <td className="px-2 py-1">{m.moneda}</td>
                                          <td className="px-2 py-1">{m.fecha_matricula}</td>
                                          <td className="px-2 py-1 flex gap-1 flex-wrap">
                                            {isAgregado && (
                                              <button
                                                className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                                onClick={() => {
                                                  setAlumnosAgregadosPorPrograma(prev => {
                                                    const arr = prev[programa.id] || [];
                                                    return { ...prev, [programa.id]: arr.filter(dni => dni !== m.dni) };
                                                  });
                                                }}
                                              >Eliminar</button>
                                            )}
                                            {m.EnSolicitud && !isAgregado && (
                                              <span className="text-xs bg-yellow-300 text-yellow-800 px-2 py-1 rounded">
                                                En solicitud pendiente
                                              </span>
                                            )}
                                            {m.agregadoEnSesion && !m.EnSolicitud && !isAgregado && (
                                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                                Agregado en sesión
                                              </span>
                                            )}
                                            {!m.EnSolicitud && m.monto_propuesto_daf !== undefined && m.monto_propuesto_daf !== null && m.monto_propuesto_daf !== m.monto_propuesto && !isAgregado && (
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
                                            {m.posible_atipico && (m.etapa_venta_propuesto === '3 - Matrícula' || m.etapa_venta_propuesto === '4 - Cerrada/Ganada') && !isAgregado && (
                                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                                Atípico
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {/* Botón para mostrar el modal de alumnos (matriculados y no matriculados) */}
                                    <tr>
                                      <td colSpan={8} className="text-center py-2">
                                        <button
                                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
                                          onClick={() => {
                                            const oportunidades = programa.oportunidades || [];
                                            const matriculados = oportunidades.filter(m => m.etapa_venta_propuesto === '3 - Matrícula' || m.etapa_venta_propuesto === '4 - Cerrada/Ganada');
                                            const noMatriculados = oportunidades.filter(m => m.etapa_venta_propuesto !== '3 - Matrícula' && m.etapa_venta_propuesto !== '3.5 - Tentativa Matricula' && m.etapa_venta_propuesto !== '4 - Cerrada/Ganada');
                                            const todos = [...matriculados, ...noMatriculados];
                                            setAlumnosModalData(todos);
                                            setShowAlumnosModal(true);
                                            setAlumnosModalSearch('');
                                          }}
                                        >
                                          Agregar Alumno
                                        </button>
                                      </td>
                                    </tr>
      {/* Modal de alumnos no matriculados */}
      <AlumnosModal
        open={showAlumnosModal}
        alumnos={alumnosModalData}
        onClose={() => setShowAlumnosModal(false)}
        search={alumnosModalSearch}
        onAgregarAlumno={(alumno) => {
          // 1. Marcar como agregado y tipo agregar_alumno
          setAlumnosAgregadosPorPrograma(prev => {
            const arr = prev[programa.id] || [];
            if (!arr.some(a => a.dni === alumno.dni)) {
              return { ...prev, [programa.id]: [...arr, { ...alumno, tipo: 'agregar_alumno', agregadoEnSesion: true }] };
            }
            return prev;
          });
          // 2. Agregar o actualizar en la grilla principal (localProgramas)
          setLocalProgramas(prev => {
            const updated = prev.map(p => {
              if (p.id !== programa.id) return p;
              // Si ya existe, actualiza etapa y marca como agregado
              if (p.oportunidades.some(o => o.dni === alumno.dni)) {
                return {
                  ...p,
                  oportunidades: p.oportunidades.map(o =>
                    o.dni === alumno.dni
                      ? {
                          ...o,
                          etapa_venta_propuesto: '3.5 - Tentativa Matricula',
                          tipo: 'agregar_alumno',
                          agregadoEnSesion: true
                        }
                      : o
                  )
                };
              }
              // Si no existe, lo agrega
              return {
                ...p,
                oportunidades: [
                  ...p.oportunidades,
                  {
                    ...alumno,
                    tipo: 'agregar_alumno',
                    agregadoEnSesion: true,
                    etapa_venta_propuesto: '3.5 - Tentativa Matricula',
                  }
                ]
              };
            });
            if (onUpdateProgramas) onUpdateProgramas(gridId, updated);
            return updated;
          });
          setShowAlumnosModal(false);
        }}
      />
                                  </>
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
                <td className="px-4 py-3 text-right" colSpan={3}>Totales:</td>
                <td className="px-4 py-3 text-right">
                  {Math.round(programasFiltrados.reduce((sum, prog) => sum + (prog.meta_venta || 0), 0)).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  {Math.round(programasFiltrados.reduce((sum, prog) => sum + (prog.meta_alumnos || 0), 0))}
                </td>
                <td className="px-4 py-3 text-center">
                  {Math.round(programasFiltrados.reduce((sum, prog) => {
                    const matriculados = (prog.oportunidades || []).filter(
                      p => p.etapa_venta_propuesto === '3 - Matrícula' || p.etapa_venta_propuesto === '4 - Cerrada/Ganada'
                    );
                    return sum + (prog.alumnos_reales || matriculados.length);
                  }, 0))}
                </td>
                <td className="px-4 py-3 text-right">
                  {Math.round(programasFiltrados.reduce((sum, prog) => sum + (prog.monto_real || 0), 0)).toLocaleString()}
                </td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramasGrillaJP;