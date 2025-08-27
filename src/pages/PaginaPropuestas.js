import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { usePropuestas } from '../context/PropuestasContext';
import {
  ESTADOS,
  ROLES
} from '../utils/mockData';
import ModalNuevaPropuesta from '../components/Propuestas/ModalNuevaPropuesta';
import ModalSeleccionRol from '../components/ModalSeleccionRol';
import ModalBusquedaAvanzada from '../components/Propuestas/ModalBusquedaAvanzada';
import PropuestasHeader from '../components/Propuestas/PropuestasHeader';
import PropuestasToolbar from '../components/Propuestas/PropuestasToolbar';
import TablaPropuestas from '../components/Propuestas/TablaPropuestas';
import PropuestasTabsPrincipal from '../components/Propuestas/PropuestasTabsPrincipal';

const PaginaPropuestas = () => {
  const navigate = useNavigate();
  const { currentRole, currentUserJP, currentUserSubdirector } = useRole();
  const { propuestas, setPropuestas } = usePropuestas();

  const [propuestasFiltradas, setPropuestasFiltradas] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estados: [],
    carteras: []
  });

  const [modalNuevaPropuesta, setModalNuevaPropuesta] = useState(false);
  const [modalSeleccionRol, setModalSeleccionRol] = useState(false);
  const [propuestaSeleccionada, setPropuestaSeleccionada] = useState(null);
  const [busquedaNombre, setBusquedaNombre] = useState('');
  const [modalBusquedaAvanzada, setModalBusquedaAvanzada] = useState(false);
  const [activeTab, setActiveTab] = useState('abiertas');
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
    return propuestas;
  }, [currentRole, currentUserJP, currentUserSubdirector]);

  useEffect(() => {
    let filtradas = filtrarPorRol(propuestas);

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
        d.setHours(23, 59, 59, 999);
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
        const fFin = parseFecha(filtros.fechaFin, true);
        if (fFin && fechaPropuestaObj > fFin) return false;
      }
      return true;
    });

    if (filtros.estados.length > 0) {
      filtradas = filtradas.filter(p => filtros.estados.includes(p.estado));
    }

    if (filtros.carteras.length > 0) {
      filtradas = filtradas.filter(p =>
        p.carteras?.some(c => filtros.carteras.includes(c))
      );
    }

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
    if (rol === 'daf-sd' && propuesta.estado === ESTADOS.PRE_CONCILIADO) {
      ruta = `/propuesta/daf-sd/pre-conciliado/${propuesta.id}`;
    } else if (rol === 'daf-sd' && propuesta.estado === ESTADOS.AUTORIZACION) {
      ruta = `/propuesta/daf-sd/autorizacion/${propuesta.id}`;
    } else {
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

  const propuestasAbiertas = propuestasFiltradas.filter(p =>
    [ESTADOS.PROGRAMADA, ESTADOS.GENERADA, ESTADOS.PRE_CONCILIADO, ESTADOS.APROBACION].includes(p.estado)
  );
  const propuestasConciliacion = propuestasFiltradas.filter(p =>
    p.estado === ESTADOS.CONCILIACION
  );
  const propuestasCanceladas = propuestasFiltradas.filter(p =>
    p.estado === ESTADOS.CANCELADO
  );

  const formatFechaParaTexto = useCallback((v) => {
    if (!v) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-");
      return `${d}/${m}/${y}`;
    }
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
    <div className="min-h-screen bg-gray-100">
        <PropuestasHeader onBack={() => navigate('/main')} titulo={"GESTIÓN DE PROPUESTAS"} />
        <PropuestasToolbar
          busquedaNombre={busquedaNombre}
          setBusquedaNombre={setBusquedaNombre}
          rangoTexto={rangoTexto}
          estadosTexto={estadosTexto}
          carterasTexto={carterasTexto}
          onOpenBusquedaAvanzada={() => setModalBusquedaAvanzada(true)}
          onOpenNuevaPropuesta={() => setModalNuevaPropuesta(true)}
        />

        <ModalBusquedaAvanzada
          isOpen={modalBusquedaAvanzada}
          onClose={() => setModalBusquedaAvanzada(false)}
          filtros={filtros}
          setFiltros={setFiltros}
          ESTADOS={ESTADOS}
          todasCarteras={todasCarteras}
          onApply={() => setModalBusquedaAvanzada(false)}
        />

        <ModalNuevaPropuesta
          isOpen={modalNuevaPropuesta}
          onClose={() => setModalNuevaPropuesta(false)}
          onPropuestaCreada={handleNuevaPropuesta}
        />

        <PropuestasTabsPrincipal activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'abiertas' && (
          <TablaPropuestas
            titulo="Abiertas"
            propuestas={propuestasAbiertas}
            currentRole={currentRole}
            onEntrar={handleEntrarPropuesta}
            onCancelar={handleCancelarPropuesta}
          />
        )}

        {activeTab === 'conciliadas' && (
          <TablaPropuestas
            titulo="Conciliadas"
            propuestas={propuestasConciliacion}
            currentRole={currentRole}
            onEntrar={handleEntrarPropuesta}
            onVer={handleVerPropuesta}
            onCancelar={handleCancelarPropuesta}
          />
        )}

        {activeTab === 'canceladas' && (
          <TablaPropuestas
            titulo="Canceladas"
            propuestas={propuestasCanceladas}
            currentRole={currentRole}
            onEntrar={handleEntrarPropuesta}
            onVer={handleVerPropuesta}
            showMotivoCancelacion
          />
        )}

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
