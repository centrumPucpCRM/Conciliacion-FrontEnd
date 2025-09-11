import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useParams } from 'react-router-dom';
import { usePropuestas } from '../context/PropuestasContext';
import { useProgramas } from '../context/ProgramasContext';
import { useRole } from '../context/RoleContext';
import { format, subMonths } from 'date-fns';

const money = (v) => `S/ ${(v ?? 0).toLocaleString()}`;

const Ver = ({ estado = 'mesConciliado' }) => {
  const { propuestaId } = useParams();
  const { propuestas } = usePropuestas();
  const { programas } = useProgramas();
  const { currentUser, currentRole } = useRole();

  const [expanded, setExpanded] = useState(() => new Set());

  // --- Propuesta ---
  const propuesta = useMemo(() => {
    const found = propuestas.find((p) => p.id === propuestaId);
    if (found) return found;
    const now = new Date();
    return {
      id: propuestaId,
      nombre: `Propuesta_${propuestaId}`,
      fecha_propuesta: now,
      estado: 'pre-conciliado',
      carteras: [],
      fecha_creacion: now,
      fecha_actualizacion: now,
    };
  }, [propuestas, propuestaId]);

  // Mes base de la propuesta -> yyyy-MM (usa mes_propuesta si existe; si no, desde fecha_propuesta)
  const mesBase = useMemo(() => {
    if (propuesta?.mes_propuesta) return propuesta.mes_propuesta;
    if (propuesta?.fecha_propuesta) return format(new Date(propuesta.fecha_propuesta), 'yyyy-MM');
    return format(new Date(), 'yyyy-MM');
  }, [propuesta]);

  // Mes objetivo = mesBase - 1 (para “Conciliación”)
  const mesMenos1 = useMemo(() => {
    const [y, m] = mesBase.split('-').map(Number);
    return format(subMonths(new Date(y, m - 1, 1), 1), 'yyyy-MM');
  }, [mesBase]);

  // Extraer mes (yyyy-MM) de cada programa
  const mesDePrograma = useCallback(
    (p) => {
      if (p?.mes_inaguracion) return p.mes_inaguracion;
      if (p?.fecha_inaguracion) return format(new Date(p.fecha_inaguracion), 'yyyy-MM');
      return mesBase; // fallback defensivo
    },
    [mesBase]
  );

  // --- Carteras permitidas por rol (Set) ---
  const carterasPermitidasSet = useMemo(() => {
    if (currentUser?.carteras?.length) {
      return new Set(currentUser.carteras);
    }
    // DAF/Admin ven carteras de la propuesta
    return new Set(propuesta.carteras ?? []);
  }, [currentUser, propuesta.carteras]);

  // --- Programas dentro de la propuesta ∩ carteras permitidas ---
  const programasDePropuesta = useMemo(() => {
    const carterasPropuesta = new Set(propuesta.carteras ?? []);
    return programas.filter(
      (p) => carterasPropuesta.has(p.cartera) && carterasPermitidasSet.has(p.cartera)
    );
  }, [programas, propuesta.carteras, carterasPermitidasSet]);

  // Expand / Collapse fila
  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // =======================
  //  FILTRO POR CARTERAS
  // =======================
  const [selectedCarteras, setSelectedCarteras] = useState([]); // string[]
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Lista única de carteras disponibles
  const todasCarteras = useMemo(() => {
    const base = programasDePropuesta.map((p) => p.cartera);
    return Array.from(new Set(base)).sort((a, b) => a.localeCompare(b));
  }, [programasDePropuesta]);

  // Cerrar el dropdown si se hace click fuera
  useEffect(() => {
    if (!showDropdown) return;
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showDropdown]);

  const allSelected =
    selectedCarteras.length === todasCarteras.length && todasCarteras.length > 0;

  const toggleCartera = (c) => {
    setSelectedCarteras((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const seleccionarTodo = () => setSelectedCarteras(todasCarteras);
  const limpiarFiltro = () => setSelectedCarteras([]);

  // 1) Filtro por cartera
  const programasFiltradosPorCartera = useMemo(() => {
    if (selectedCarteras.length === 0) return programasDePropuesta;
    return programasDePropuesta.filter((p) => selectedCarteras.includes(p.cartera));
  }, [programasDePropuesta, selectedCarteras]);

  // Comparator robusto por fecha (desc), poniendo sin fecha al final
  const cmpFechaDesc = (a, b) => {
    const ta = a?.fecha_inaguracion ? new Date(a.fecha_inaguracion).getTime() : -Infinity;
    const tb = b?.fecha_inaguracion ? new Date(b.fecha_inaguracion).getTime() : -Infinity;
    return tb - ta;
  };

  // 2) Partición por mes relativo a la propuesta
  const programasConciliacion = useMemo(() => {
    return programasFiltradosPorCartera
      .filter((p) => mesDePrograma(p) === mesMenos1) // exactamente mes - 1
      .sort(cmpFechaDesc); // reciente primero
  }, [programasFiltradosPorCartera, mesDePrograma, mesMenos1]);

  const programasPasados = useMemo(() => {
    return programasFiltradosPorCartera
      .filter((p) => mesDePrograma(p) < mesMenos1) // menores a mes - 1 (≤ mes - 2)
      .sort(cmpFechaDesc);
  }, [programasFiltradosPorCartera, mesDePrograma, mesMenos1]);

  // Derivados para render (matriculados, enRiesgo)
  const filasConciliacion = useMemo(() => {
    return programasConciliacion.map((p) => {
      const personas = Array.isArray(p.personas) ? p.personas : [];
      const matriculados = personas.filter((x) => x.estado === 'matriculado');
      const enRiesgo = matriculados.length < (p.minimo_apertura ?? 0);
      return { ...p, matriculados, enRiesgo };
    });
  }, [programasConciliacion]);

  const filasPasados = useMemo(() => {
    return programasPasados.map((p) => {
      const personas = Array.isArray(p.personas) ? p.personas : [];
      const matriculados = personas.filter((x) => x.estado === 'matriculado');
      const enRiesgo = matriculados.length < (p.minimo_apertura ?? 0);
      return { ...p, matriculados, enRiesgo };
    });
  }, [programasPasados]);

  // Normalizar estado del tab
  const estadoNorm = (estado || '').toLowerCase(); // 'mesconciliado' | 'mesespasados'

  return (
    <div className="px-12">
      <div className="bg-white shadow-soft p-8 mb-8 border border-gray-100">
        {estadoNorm === 'mesconciliado' ? (
          <SeccionTabla
            titulo="Programas (Conciliación: mes de inauguración = mes - 1 de la propuesta)"
            filas={filasConciliacion}
            expanded={expanded}
            onToggleExpand={toggleExpand}
            // 🔹 Filtro de carteras también aquí
            showFilter
            dropdownRef={dropdownRef}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            todasCarteras={todasCarteras}
            selectedCarteras={selectedCarteras}
            allSelected={allSelected}
            onToggleCartera={toggleCartera}
            onSeleccionarTodo={seleccionarTodo}
            onLimpiarFiltro={limpiarFiltro}
          />
        ) : estadoNorm === 'mesespasados' ? (
          <SeccionTabla
            titulo="Programas de meses pasados (≤ mes - 2 de la propuesta)"
            filas={filasPasados}
            expanded={expanded}
            onToggleExpand={toggleExpand}
            // 🔹 Y aquí también activado
            showFilter
            dropdownRef={dropdownRef}
            showDropdown={showDropdown}
            setShowDropdown={setShowDropdown}
            todasCarteras={todasCarteras}
            selectedCarteras={selectedCarteras}
            allSelected={allSelected}
            onToggleCartera={toggleCartera}
            onSeleccionarTodo={seleccionarTodo}
            onLimpiarFiltro={limpiarFiltro}
          />
        ) : (
          <div className="text-sm text-gray-500">
            Estado inválido: {String(estado)} (usa "mesConciliado" o "mesesPasados")
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- Sección reutilizable con tabla ----------
function SeccionTabla({
  titulo,
  filas,
  expanded,
  onToggleExpand,
  showFilter = false,
  dropdownRef,
  showDropdown,
  setShowDropdown,
  todasCarteras = [],
  selectedCarteras = [],
  allSelected = false,
  onToggleCartera,
  onSeleccionarTodo,
  onLimpiarFiltro,
}) {
  return (
    <>
      <div className="overflow-x-auto w-full mb-10">
        <table
          className="w-full divide-y divide-gray-200"
          style={{ tableLayout: 'fixed', width: '100%' }}
        >
          <colgroup>
            <col style={{ width: '10%' }} /> {/* Cartera */}
            <col style={{ width: '20%' }} /> {/* Programa */}
            <col style={{ width: '10%' }} /> {/* Fecha Inauguración */}
            <col style={{ width: '8%' }} /> {/* Meta Venta */}
            <col style={{ width: '7%' }} /> {/* Meta Alumnos */}
            <col style={{ width: '7%' }} /> {/* Alumnos Reales */}
            <col style={{ width: '10%' }} /> {/* Monto Real */}
            <col style={{ width: '8%' }} /> {/* Punto mínimo */}
            <col style={{ width: '7%' }} /> {/* En riesgo */}
            <col style={{ width: '6%' }} /> {/* No Aperturar */}
          </colgroup>

          <thead className="bg-gray-50">
            <tr className="align-middle">
              <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider relative">
                {showFilter ? (
                  <>
                    <div
                      onClick={() => setShowDropdown((prev) => !prev)}
                      className="cursor-pointer inline-flex items-center gap-2 select-none"
                    >
                      Cartera
                      <span className="text-xs text-gray-500">▼</span>
                      {selectedCarteras.length > 0 && (
                        <span className="ml-1 text-[11px] text-blue-600">
                          ({selectedCarteras.length})
                        </span>
                      )}
                    </div>

                    {showDropdown && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-30 mt-2 bg-white border rounded shadow-lg p-2 max-h-60 overflow-auto"
                      >
                        <div className="px-2 pb-2 border-b mb-2 flex items-center gap-2">
                          <button
                            onClick={allSelected ? onLimpiarFiltro : onSeleccionarTodo}
                            className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            {allSelected ? 'Limpiar' : 'Seleccionar todo'}
                          </button>
                          {selectedCarteras.length > 0 && (
                            <button
                              onClick={onLimpiarFiltro}
                              className="text-xs px-2 py-1 text-blue-600 hover:underline"
                            >
                              Limpiar filtro
                            </button>
                          )}
                        </div>

                        {todasCarteras.length === 0 ? (
                          <div className="px-2 py-1 text-xs text-gray-500">Sin carteras</div>
                        ) : (
                          todasCarteras.map((c) => (
                            <label
                              key={c}
                              className="flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-gray-100"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCarteras.includes(c)}
                                onChange={() => onToggleCartera(c)}
                                className="form-checkbox h-4 w-4 text-blue-600"
                              />
                              {c}
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <span>Cartera</span>
                )}
              </th>
              <Th>Programa</Th>
              <Th center>Fecha<br />Inauguración</Th>
              <Th center>Meta<br />Venta</Th>
              <Th center>Meta<br />Alumnos</Th>
              <Th center>Alumnos<br />Reales</Th>
              <Th center>Monto<br />Real</Th>
              <Th center>Punto mínimo<br />de apertura</Th>
              <Th center className="whitespace-nowrap">En riesgo</Th>
              <Th center>No Aperturar<br />(DAF)</Th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {filas.map((programa) => (
              <ProgramaRow
                key={programa.id}
                programa={programa}
                isExpanded={expanded.has(programa.id)}
                onToggle={onToggleExpand}
              />
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-gray-500 py-6">
                  No hay programas para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------- Subcomponentes ----------
const Th = ({ children, center = false, className = '' }) => (
  <th
    className={`${center ? 'text-center' : 'text-left'} px-4 py-3 text-xs font-medium text-gray-500 capitalize tracking-wider ${className}`}
  >
    <span className="block whitespace-normal leading-tight">{children}</span>
  </th>
);

const ProgramaRow = React.memo(function ProgramaRow({ programa, isExpanded, onToggle }) {
  const cancelar = !!programa.cancelar;
  const handleClick = useCallback(() => onToggle(programa.id), [onToggle, programa.id]);

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
        onClick={handleClick}
        aria-expanded={isExpanded}
      >
        <td className="px-4 py-3 text-sm text-gray-700">{programa.cartera}</td>
        <td className="px-4 py-3 text-sm text-gray-900 leading-relaxed">{programa.nombre}</td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
          {programa.fecha_inaguracion
            ? new Date(programa.fecha_inaguracion).toLocaleDateString('es-PE')
            : '—'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
          {money(programa.meta_venta)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
          {programa.meta_alumnos ?? '0'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
          {programa.alumnos_reales ?? programa.matriculados.length}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
          {money(programa.monto_real)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
          {programa.minimo_apertura ?? 0}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              programa.enRiesgo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
            }`}
          >
            {programa.enRiesgo ? 'En riesgo' : 'OK'}
          </span>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-center">
          <input
            type="checkbox"
            checked={cancelar}
            readOnly
            className="form-checkbox h-5 w-5 text-accent-orange border-gray-300 rounded cursor-not-allowed opacity-60 pointer-events-none"
            tabIndex={-1}
            aria-label="No Aperturar (solo lectura)"
          />
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={10} className="bg-blue-50 px-4 py-2">
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
                  {programa.matriculados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-500 py-2">Sin matriculados</td>
                    </tr>
                  ) : (
                    programa.matriculados.map((m, idx) => (
                      <tr
                        key={m.identificador ?? idx}
                        className={
                          m.agregadoEnSesion || m.monto_editado_en_sesion
                            ? 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 transition-colors'
                            : ''
                        }
                      >
                        <td className="px-2 py-1 font-mono">{m.identificador}</td>
                        <td className="px-2 py-1 text-xs">{m.alumno || 'N/A'}</td>
                        <td className="px-2 py-1">{money(m.monto)}</td>
                        <td className="px-2 py-1">
                          {m.monto_propuesto ? (
                            <span className="text-purple-600 font-medium">
                              {money(m.monto_propuesto)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-2 py-1">{m.moneda}</td>
                        <td className="px-2 py-1">{m.fecha_estado}</td>
                        <td className="px-2 py-1">
                          {m.agregadoEnSesion && (
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                              Agregado en sesión
                            </span>
                          )}
                          {m.monto_editado_en_sesion && (
                            <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded ml-1">
                              Monto editado
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
    </>
  );
});

export default Ver;
