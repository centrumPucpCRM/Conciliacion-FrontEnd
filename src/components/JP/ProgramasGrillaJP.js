import React, { useState, useMemo, useRef, useEffect } from 'react';
import AlumnosModal from '../common/AlumnosModal';
import useProgramasGridState from './hooks/useProgramasGridState';

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
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    programas: localProgramas,
    agregados: agregadosPorPrograma,
    handleChangeMonto,
    handleRevertMonto,
    handleAgregarAlumno,
    handleEliminarAlumno,
    mutateProgramas,
  } = useProgramasGridState({
    programas,
    gridId,
    onUpdateProgramas,
    onChangeMonto,
    onRevertMonto,
  });

  const [showAlumnosModal, setShowAlumnosModal] = useState(false);
  const [alumnosModalData, setAlumnosModalData] = useState([]);
  const [alumnosModalSearch, setAlumnosModalSearch] = useState('');
  const [modalProgramaId, setModalProgramaId] = useState(null);

  const handleCancelarChange = (programaId) => {
    mutateProgramas((prev) =>
      prev.map((prog) =>
        String(prog.id) === String(programaId)
          ? {
              ...prog,
              cancelar: !prog.cancelar,
            }
          : prog
      )
    );
    if (onToggleCancelar) {
      onToggleCancelar(programaId);
    }
  };

  const todasCarteras = useMemo(() => {
    const set = new Set(localProgramas.map((p) => p.cartera));
    return Array.from(set);
  }, [localProgramas]);

  const programasFiltrados = useMemo(() => {
    if (!selectedCarteras || selectedCarteras.length === 0) {
      return localProgramas;
    }
    return localProgramas.filter((p) => selectedCarteras.includes(p.cartera));
  }, [localProgramas, selectedCarteras]);

  const openAgregarAlumnoModal = (programa) => {
    const oportunidades = programa.oportunidades || [];
    const matriculados = oportunidades.filter(
      (m) =>
        m.etapa_venta_propuesto === '3 - Matricula' ||
        m.etapa_venta_propuesto === '4 - Cerrada/Ganada'
    );
    const noMatriculados = oportunidades.filter(
      (m) =>
        m.etapa_venta_propuesto !== '3 - Matricula' &&
        m.etapa_venta_propuesto !== '3.5 - Tentativa Matricula' &&
        m.etapa_venta_propuesto !== '4 - Cerrada/Ganada'
    );
    setModalProgramaId(programa.id);
    setAlumnosModalData([...matriculados, ...noMatriculados]);
    setAlumnosModalSearch('');
    setShowAlumnosModal(true);
  };

  const handleCloseModal = () => {
    setShowAlumnosModal(false);
    setModalProgramaId(null);
    setAlumnosModalSearch('');
  };

  const handleAgregarDesdeModal = (alumno) => {
    if (modalProgramaId === null) {
      return;
    }
    handleAgregarAlumno(modalProgramaId, alumno);
    handleCloseModal();
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-12">
      <div className="bg-white shadow-soft p-8 mb-8 border border-gray-20 min-h-full w-full" style={{ minHeight: '100%', width: '100%' }}>
        <div>
          <table className="w-full text-sm align-top">
            <colgroup>
              <col style={{ width: '1%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '1%' }} />
              <col style={{ width: '5%' }} />
              <col style={{ width: '5%' }} />
              <col style={{ width: '1%' }} />
              <col style={{ width: '1%' }} />
              <col style={{ width: '1%' }} />
            </colgroup>

            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="align-middle">
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider relative">
                  <div
                    onClick={() => setShowDropdown((prev) => !prev)}
                    className="cursor-pointer flex items-center justify-between"
                  >
                    Cartera
                    <span className="ml-2 text-xs text-gray-500">?</span>
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
                        {todasCarteras.map((c) => (
                          <label key={c} className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100">
                            <input
                              type="checkbox"
                              checked={selectedCarteras.includes(c)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCarteras((prev) => [...prev, c]);
                                } else {
                                  setSelectedCarteras((prev) => prev.filter((x) => x !== c));
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
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Fecha<br />Inauguración</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Meta<br />Venta</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Meta<br />Alumnos</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Alumnos<br />Reales</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Monto<br />Real</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">Punto mínimo<br />de apertura</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-400  align-top">
              {programasFiltrados.map((programa) => {
                const matriculados = (programa.oportunidades || []).filter(
                  (p) =>
                    p.etapa_venta_propuesto === '3 - Matricula' ||
                    p.etapa_venta_propuesto === '3.5 - Tentativa Matricula' ||
                    p.etapa_venta_propuesto === '4 - Cerrada/Ganada'
                );

                const tieneAtipicoMatriculado = matriculados.some((o) => o.posible_atipico);
                const agregadosPrograma = agregadosPorPrograma[String(programa.id)] || {};

                return (
                  <React.Fragment key={programa.id_programa}>
                    <tr
                      className={`transition-colors duration-200 ${
                        tieneAtipicoMatriculado ? 'bg-yellow-100 hover:bg-yellow-200' : 'hover:bg-blue-50'
                      }`}
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
                          : 'Sin fecha'}
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
                        {programa.alumnos_reales ?? matriculados.length}
                      </td>
                      <td
                        className="px-4 py-3 text-right text-sm text-gray-900 cursor-pointer"
                        onClick={() => onToggleExpand(programa.id)}
                      >
                        {Math.round(programa.monto_real || 0).toLocaleString()}
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
                                      const registroGestion = agregadosPrograma[String(m.dni)];
                                      const esAgregadoSesion = Boolean(m.agregadoEnSesion);
                                      const isNuevoAgregado = registroGestion?.isNew === true;
                                      const valorOriginal =
                                        registroGestion?.original?.monto_propuesto ??
                                        registroGestion?.original?.monto_propuesto_daf ??
                                        m.monto_propuesto ??
                                        m.monto;
                                      const valorActual =
                                        m.monto_propuesto_daf ?? m.monto_propuesto ?? m.monto;
                                      const diferenciaMonto =
                                        Number(valorActual ?? 0) !== Number(valorOriginal ?? 0);
                                      const mostrarRevertir =
                                        !m.EnSolicitud && !esAgregadoSesion && diferenciaMonto;
                                      const mostrarBadgeAgregado = esAgregadoSesion;
                                      const puedeEliminar = esAgregadoSesion;
                                      const baseClass = 'transition-colors';
                                      const rowClass = isNuevoAgregado
                                        ? 'bg-yellow-300 text-gray-900'
                                        : m.EnSolicitud
                                        ? 'bg-yellow-200 text-gray-900'
                                        : mostrarRevertir || mostrarBadgeAgregado
                                        ? 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 ' + baseClass
                                        : baseClass;
                                      return (
                                        <tr key={mIdx} className={rowClass}>
                                          <td className="px-2 py-1 font-mono">{m.dni}</td>
                                          <td className="px-2 py-1 text-xs">{m.alumno || 'N/A'}</td>
                                          <td className="px-2 py-1">
                                            {m.descuento
                                              ? `${(Number(m.descuento) * 100).toLocaleString('es-PE', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                                })}%`
                                              : '-'}
                                          </td>
                                          <td className="px-2 py-1"><span>{m.monto}</span></td>
                                          <td className="px-2 py-1">
                                            {m.EnSolicitud ? (
                                              <span className="text-gray-600">{m.monto_propuesto || m.monto}</span>
                                            ) : (
                                              <input
                                                type="number"
                                                value={
                                                  m.monto_propuesto_daf !== undefined && m.monto_propuesto_daf !== null
                                                    ? m.monto_propuesto_daf
                                                    : m.monto_propuesto ?? ''
                                                }
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
                                            {puedeEliminar && (
                                              <button
                                                className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEliminarAlumno(programa.id, m.dni);
                                                }}
                                              >
                                                Eliminar
                                              </button>
                                            )}
                                            {m.EnSolicitud && !isNuevoAgregado && (
                                              <span className="text-xs bg-yellow-300 text-yellow-800 px-2 py-1 rounded">
                                                En solicitud pendiente
                                              </span>
                                            )}
                                            {mostrarBadgeAgregado && (
                                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                                Agregado en sesión
                                              </span>
                                            )}
                                            {mostrarRevertir && (
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
                                            {mostrarRevertir && (
                                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                                Monto editado
                                              </span>
                                            )}
                                            {m.posible_atipico &&
                                              (m.etapa_venta_propuesto === '3 - Matrícula' ||
                                                m.etapa_venta_propuesto === '4 - Cerrada/Ganada') &&
                                              !isNuevoAgregado && (
                                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                                  Atípico
                                                </span>
                                              )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    <tr>
                                      <td colSpan={8} className="text-center py-2">
                                        <button
                                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
                                          onClick={() => openAgregarAlumnoModal(programa)}
                                        >
                                          Agregar Alumno
                                        </button>
                                      </td>
                                    </tr>
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
                  {Math.round(
                    programasFiltrados.reduce((sum, prog) => {
                      const matriculados = (prog.oportunidades || []).filter(
                        (p) => p.etapa_venta_propuesto === '3 - Matrícula' || p.etapa_venta_propuesto === '4 - Cerrada/Ganada'
                      );
                      return sum + (prog.alumnos_reales || matriculados.length);
                    }, 0)
                  )}
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

      <AlumnosModal
        open={showAlumnosModal}
        alumnos={alumnosModalData}
        onClose={handleCloseModal}
        search={alumnosModalSearch}
        onAgregarAlumno={handleAgregarDesdeModal}
      />
    </div>
  );
};

export default ProgramasGrillaJP;
