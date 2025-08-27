import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { usePropuestas } from '../context/PropuestasContext';
import { 
  ESTADOS, 
  tienePermiso, 
  puedeCancelar,
  formatearFecha,
  obtenerColorEstado,
  ROLES
} from '../utils/mockData';
import ModalNuevaPropuesta from '../components/ModalNuevaPropuesta';
import RoleSwitch from '../components/RoleSwitch';
import ModalSeleccionRol from '../components/ModalSeleccionRol'; // <-- si no lo tenías, agrégalo
import ModalBusquedaAvanzada from '../components/ModalBusquedaAvanzada';

const PaginaPropuestas = () => {
  const navigate = useNavigate();
  const { currentRole, currentUserJP, currentUserSubdirector } = useRole();
  const { propuestas, setPropuestas } = usePropuestas();

  const [propuestasFiltradas, setPropuestasFiltradas] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estados: [],   // <- ahora array
    carteras: []   // <- ahora array
  });
  const [modalNuevaPropuesta, setModalNuevaPropuesta] = useState(false);
  const [modalSeleccionRol, setModalSeleccionRol] = useState(false);
  const [propuestaSeleccionada, setPropuestaSeleccionada] = useState(null);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [modalBusquedaAvanzada, setModalBusquedaAvanzada] = useState(false);
  const { fechaInicio, fechaFin, estados, carteras } = filtros;

  // Opciones de carteras para el filtro avanzado
  const todasCarteras = useMemo(() => {
    const set = new Set();
    propuestas.forEach(p => p.carteras.forEach(c => set.add(c)));
    return Array.from(set);
  }, [propuestas]);

  // Filtrar propuestas según el rol
  const filtrarPorRol = useCallback((propuestas) => {
    if (currentRole === ROLES.JP && currentUserJP) {
      return propuestas.filter(p =>
        p.carteras.some(c => currentUserJP.carteras.includes(c))
      );
    }
    if (currentRole === ROLES.SUBDIRECTOR && currentUserSubdirector) {
      return propuestas.filter(p =>
        p.carteras.some(c => currentUserSubdirector.carteras.includes(c))
      );
    }
    // DAF y Administrador ven todo
    return propuestas;
  }, [currentRole, currentUserJP, currentUserSubdirector]);

  useEffect(() => {
    let filtradas = filtrarPorRol(propuestas);

    // Convierte dd/mm/yyyy o yyyy-mm-dd a Date
    const parseFecha = (fechaStr, endOfDay = false) => {
      if (!fechaStr) return null;
      let d;
      if (typeof fechaStr === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) {
          const [y, m, dd] = fechaStr.split('-');
          d = new Date(Number(y), Number(m) - 1, Number(dd));
        } else if (/^\d{2}\/\d{2}\/\d{4}/.test(fechaStr)) {
          const [dd, m, y] = fechaStr.split('/');
          d = new Date(Number(y), Number(m) - 1, Number(dd));
        } else {
          d = new Date(fechaStr);
        }
      } else if (fechaStr instanceof Date) {
        d = fechaStr;
      } else {
        d = new Date(fechaStr);
      }
      if (endOfDay && d instanceof Date && !isNaN(d)) {
        d.setHours(23, 59, 59, 999); // fecha fin inclusiva
      }
      return d;
    };

    filtradas = filtradas.filter((p) => {
      const fechaPropuesta = p.fecha_creacion || p.fecha_propuesta;
      const fechaPropuestaObj = parseFecha(fechaPropuesta);
      if (!fechaPropuestaObj || isNaN(fechaPropuestaObj.getTime())) return false;

      if (filtros.fechaInicio) {
        const fIni = parseFecha(filtros.fechaInicio);
        if (fIni && fechaPropuestaObj < fIni) return false;
      }
      if (filtros.fechaFin) {
        const fFin = parseFecha(filtros.fechaFin, true); // inclusiva
        if (fFin && fechaPropuestaObj > fFin) return false;
      }
      return true;
    });

    // 🔹 Estados múltiples
    if (filtros.estados.length > 0) {
      filtradas = filtradas.filter(p => filtros.estados.includes(p.estado));
    }

    // 🔹 Carteras múltiples (intersección)
    if (filtros.carteras.length > 0) {
      filtradas = filtradas.filter(p =>
        p.carteras?.some(c => filtros.carteras.includes(c))
      );
    }

    // 🔹 Búsqueda por nombre
    if (busquedaNombre.trim()) {
      const q = busquedaNombre.trim().toLowerCase();
      filtradas = filtradas.filter(p => p.nombre.toLowerCase().includes(q));
    }

    setPropuestasFiltradas(filtradas);    
  }, [propuestas, filtros, busquedaNombre, currentRole, currentUserJP, currentUserSubdirector, filtrarPorRol]);

  const handleNuevaPropuesta = (nuevaPropuesta) => {
    setPropuestas(prev => [nuevaPropuesta, ...prev]);
  };

  const handleEntrarPropuesta = (propuesta) => {
    if (currentRole === 'administrador') {
      setPropuestaSeleccionada(propuesta);
      setModalSeleccionRol(true);
    } else {
      navegarAPropuesta(propuesta, currentRole);
    }
  };

  const handleRolSeleccionado = (rol) => {
    navegarAPropuesta(propuestaSeleccionada, rol);
  };

  const navegarAPropuesta = (propuesta, rol) => {
    let ruta;
    
    // Lógica especial para DAF-SD en estado pre-conciliado
    if (rol === 'daf-sd' && propuesta.estado === ESTADOS.PRE_CONCILIADO) {
      ruta = `/propuesta/daf-sd/pre-conciliado/${propuesta.id}`;
    }
    // Lógica especial para DAF-SD en estado autorización
    else if (rol === 'daf-sd' && propuesta.estado === ESTADOS.AUTORIZACION) {
      ruta = `/propuesta/daf-sd/autorizacion/${propuesta.id}`;
    }
    // Lógica estándar para todos los demás casos
    else {
      ruta = `/propuesta/${rol}/${propuesta.estado}/${propuesta.id}`;
    }
    
    navigate(ruta);
  };

  const handleVerPropuesta = (propuesta) => {
    navigate(`/ver-propuesta/${propuesta.id}`);
  };

  const handleCancelarPropuesta = (propuesta) => {
    if (window.confirm(`¿Está seguro de que desea cancelar la propuesta "${propuesta.nombre}"?`)) {
      setPropuestas(prev =>
        prev.map(p =>
          p.id === propuesta.id
            ? { ...p, estado: ESTADOS.CANCELADO, fecha_actualizacion: new Date() }
            : p
        )
      );
    }
  };

  // Filtros para las grillas
  const propuestasAbiertas = propuestasFiltradas.filter(p =>
    [ESTADOS.PROGRAMADA, ESTADOS.GENERADA, ESTADOS.PRE_CONCILIADO, ESTADOS.APROBACION].includes(p.estado)
  );
  const propuestasConciliacion = propuestasFiltradas.filter(p =>
    p.estado === ESTADOS.CONCILIACION
  );
  const propuestasCanceladas = propuestasFiltradas.filter(p =>
    p.estado === ESTADOS.CANCELADO
  );


  // --- Helpers para formatear fechas y texto de filtros ---
  const formatFechaParaTexto = useCallback((v) => {
    if (!v) return null;
    // input type="date" => 'yyyy-mm-dd'
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-");
      return `${d}/${m}/${y}`;
    }
    // ya viene como dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return v;

    const dt = new Date(v);
    return isNaN(dt) ? v : dt.toLocaleDateString("es-PE");
  }, []);

  const rangoTexto = useMemo(() => {
    if (!fechaInicio && !fechaFin) return "";
    const fi = fechaInicio ? formatFechaParaTexto(fechaInicio) : null;
    const ff = fechaFin ? formatFechaParaTexto(fechaFin) : null;
    if (fi && ff) return `Desde ${fi} hasta ${ff}`;
    if (fi && !ff) return `Desde ${fi}`;
    if (!fi && ff) return `Hasta ${ff}`;
    return "";
  }, [fechaInicio, fechaFin, formatFechaParaTexto]);

  const estadosTexto = useMemo(() => (
    estados.length ? estados.join(", ") : ""
  ), [estados]);

  const carterasTexto = useMemo(() => (
    carteras.length ? carteras.join(", ") : ""
  ), [carteras]);




  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
  <div className="px-4 sm:px-6 lg:px-8 pt-6">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <button
        className="flex items-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-xl shadow hover:bg-blue-100 transition font-semibold text-gray-700"
        onClick={() => navigate('/main')}
      >
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al inicio
      </button>

      <div className="flex-shrink-0">
        <RoleSwitch />
      </div>
    </div>
  </div>

{/* Buscadores y Nueva Propuesta */}
<div className="px-4 sm:px-6 lg:px-8 mt-8">
  <div className="max-w-[99%] mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-4 md:p-6 lg:p-8">
    <div className="flex items-center gap-4 flex-wrap">
      {/* Input con ícono (ocupa el espacio) */}
      <div className="flex-1 flex items-center text-2xl font-bold text-blue-700">
        <svg className="w-6 h-6 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg font-normal text-blue-900 bg-blue-50"
          placeholder="Buscar propuesta por nombre..."
          value={busquedaNombre}
          onChange={e => setBusquedaNombre(e.target.value)}
        />
      </div>
      {/*Texto adicional*/}
    {/* Texto adicional: resumen de filtros */}
    {(rangoTexto || estadosTexto || carterasTexto) && (
      <div className="flex-1 min-w-[220px] text-sm text-blue-700 whitespace-pre-line leading-6">
        {rangoTexto && (
          <div>
            <span className="font-semibold">Fecha:</span> {rangoTexto}
          </div>
        )}
        {estadosTexto && (
          <div>
            <span className="font-semibold">Estados:</span> {estadosTexto}
          </div>
        )}
        {carterasTexto && (
          <div>
            <span className="font-semibold">Carteras:</span> {carterasTexto}
          </div>
        )}
      </div>
    )}

      {/* Botón búsqueda avanzada */}
      <button
        className="flex items-center gap-2 text-blue-700 hover:text-blue-900"
        onClick={() => setModalBusquedaAvanzada(true)}
      >
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
        Búsqueda avanzada
      </button>

      {/* Botón nueva propuesta */}
      <button
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition"
        onClick={() => setModalNuevaPropuesta(true)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nueva propuesta
      </button>
    </div>
  </div>
</div>

      <ModalBusquedaAvanzada
        isOpen={modalBusquedaAvanzada}
        onClose={() => setModalBusquedaAvanzada(false)}
        filtros={filtros}
        setFiltros={setFiltros}
        ESTADOS={ESTADOS}
        todasCarteras={todasCarteras}
        onApply={() => setModalBusquedaAvanzada(false)} // mismo comportamiento actual
      />

      {/* Grilla 1: Propuestas abiertas */}
      <div className="px-12 mt-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-2xl font-extrabold text-blue-700 mb-2 text-left">
            Abiertas
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Nombre de Propuesta</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Fecha de Propuesta</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Carteras</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {propuestasAbiertas.map(propuesta => (
                  <tr key={propuesta.id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-900">{propuesta.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatearFecha(propuesta.fecha_propuesta)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(propuesta.estado)}`}>
                        {propuesta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">{propuesta.carteras.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {tienePermiso(currentRole, propuesta.estado) && (
                          <button
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded-lg shadow text-xs font-semibold"
                            onClick={() => handleEntrarPropuesta(propuesta)}
                          >
                            Entrar
                          </button>
                        )}
                        {tienePermiso(currentRole, propuesta.estado) && (
                          <button
                            className="px-3 py-1 bg-green-500 hover:bg-green-700 text-white rounded-lg shadow text-xs font-semibold"
                            onClick={() => handleVerPropuesta(propuesta)}
                          >
                            Ver
                          </button>
                        )}
                        {puedeCancelar(currentRole) && propuesta.estado !== ESTADOS.CANCELADO && (
                          <button
                            className="px-3 py-1 bg-red-500 hover:bg-red-700 text-white rounded-lg shadow text-xs font-semibold"
                            onClick={() => handleCancelarPropuesta(propuesta)}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grilla 2: Propuestas conciliación */}
      <div className="px-12">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-2xl font-extrabold text-blue-700 mb-2 text-left">
            Conciliadas
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Nombre de Propuesta</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Fecha de Propuesta</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Carteras</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {propuestasConciliacion.map(propuesta => (
                  <tr key={propuesta.id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-900">{propuesta.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatearFecha(propuesta.fecha_propuesta)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(propuesta.estado)}`}>
                        {propuesta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">{propuesta.carteras.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {tienePermiso(currentRole, propuesta.estado) && (
                          <button
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded-lg shadow text-xs font-semibold"
                            onClick={() => handleEntrarPropuesta(propuesta)}
                          >
                            Entrar
                          </button>
                        )}
                        {tienePermiso(currentRole, propuesta.estado) && (
                          <button
                            className="px-3 py-1 bg-green-500 hover:bg-green-700 text-white rounded-lg shadow text-xs font-semibold"
                            onClick={() => handleVerPropuesta(propuesta)}
                          >
                            Ver
                          </button>
                        )}
                        {puedeCancelar(currentRole) && propuesta.estado !== ESTADOS.CANCELADO && (
                          <button
                            className="px-3 py-1 bg-red-500 hover:bg-red-700 text-white rounded-lg shadow text-xs font-semibold"
                            onClick={() => handleCancelarPropuesta(propuesta)}
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grilla 3: Propuestas canceladas */}
      <div className="px-12">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-2xl font-extrabold text-blue-700 mb-2 text-left">
            Canceladas
          </div>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Nombre de Propuesta</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Fecha de Propuesta</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Motivo de Cancelación</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {propuestasCanceladas.map(propuesta => (
                  <tr key={propuesta.id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-900">{propuesta.nombre}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatearFecha(propuesta.fecha_propuesta)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(propuesta.estado)}`}>
                        {propuesta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{propuesta.motivo_cancelacion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {tienePermiso(currentRole, propuesta.estado) && (
                          <button
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-700 text-white rounded-lg shadow text-xs font-semibold"
                            onClick={() => handleEntrarPropuesta(propuesta)}
                          >
                            Entrar
                          </button>
                        )}
                        {tienePermiso(currentRole, propuesta.estado) && (
                          <button
                            className="px-3 py-1 bg-green-500 hover:bg-green-700 text-white rounded-lg shadow text-xs font-semibold"
                            onClick={() => handleVerPropuesta(propuesta)}
                          >
                            Ver
                          </button>
                        )}
                        {/* No mostrar cancelar en canceladas */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modales */}
      <ModalNuevaPropuesta
        isOpen={modalNuevaPropuesta}
        onClose={() => setModalNuevaPropuesta(false)}
        onPropuestaCreada={handleNuevaPropuesta}
      />
      <c
        isOpen={modalSeleccionRol}
        onClose={() => setModalSeleccionRol(false)}
        onRolSeleccionado={handleRolSeleccionado}
        propuesta={propuestaSeleccionada}
      />
    <ModalSeleccionRol
      isOpen={modalSeleccionRol}
      onClose={() => setModalSeleccionRol(false)}
      onRolSeleccionado={handleRolSeleccionado}
      propuesta={propuestaSeleccionada}
    />
    </div>
    
  );
};

export default PaginaPropuestas;