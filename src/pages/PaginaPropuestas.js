import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { usePropuestas } from '../context/PropuestasContext';
import {
  ESTADOS,
  ROLES,
  fetchMatrizPermisos
} from '../utils/mockData';
import ModalNuevaPropuesta from '../components/Propuestas/ModalNuevaPropuesta';
import ModalSeleccionRol from '../components/ModalSeleccionRol';
import ModalBusquedaAvanzada from '../components/Propuestas/ModalBusquedaAvanzada';
import PropuestasHeader from '../components/Propuestas/PropuestasHeader';
import PropuestasToolbar from '../components/Propuestas/PropuestasToolbar';
import TablaPropuestas from '../components/Propuestas/TablaPropuestas';
import PropuestasTabsPrincipal from '../components/Propuestas/PropuestasTabsPrincipal';

const PaginaPropuestas = () => {
  const [matrizPermisos, setMatrizPermisos] = useState(null);
  const [loadingPermisos, setLoadingPermisos] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchMatrizPermisos().then(data => {
      if (mounted) setMatrizPermisos(data);
    }).catch(() => {
      if (mounted) setMatrizPermisos(null);
    }).finally(() => {
      if (mounted) setLoadingPermisos(false);
    });
    return () => { mounted = false; };
  }, []);
  const navigate = useNavigate();
  const { currentUser, currentRole } = useRole();
  const { propuestas, setPropuestas } = usePropuestas();
  // Debug: log propuestas y filtros en cada render
  console.log('Usuario actual en PaginaPrincipal:', currentUser);

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
    propuestas.forEach(p => (p.carteras || []).forEach(c => set.add(c)));
    const arr = Array.from(set);
    return arr;
  }, [propuestas]);


  //Esta funcion filtra para que los JP o subdirectores solo puedan ver las propuestas en las que estan involucrados (idealmente todos, pero flexibilidad para futuro)
  const filtrarPorRol = useCallback((propuestas) => {
    if (!currentUser) {
      return propuestas;
    }
    if (currentUser?.carteras?.length > 0 && 
        (currentUser.rol === ROLES.COMERCIAL_JEFE_PRODUCTO || 
         currentUser.rol === ROLES.COMERCIAL_SUBDIRECTOR)) {
      const carterasUsuario = currentUser.carteras.map(c => c.nombre);
      return propuestas.filter(p =>
        p.carteras.some(carteraPropuesta => carterasUsuario.includes(carteraPropuesta))
      );
    }    
    return propuestas;
  }, [currentUser]);

  useEffect(() => {
    let filtradas = filtrarPorRol(propuestas);

    const parseFecha = (fechaStr, endOfDay = false) => {      
      if (!fechaStr) {
        return null;
      }
      
      let d;
      if (typeof fechaStr === 'string') {
        
        // Formato ISO YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS
        if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) {
          // Si es ISO con tiempo (YYYY-MM-DDTHH:MM:SS), usar el constructor estándar
          if (fechaStr.includes('T')) {
            d = new Date(fechaStr);
          } else {
            // Si es sólo fecha (YYYY-MM-DD), extraer componentes
            const [y, m, dd] = fechaStr.split('-');
            d = new Date(Number(y), Number(m) - 1, Number(dd));
          }
        } 
        // Formato DD/MM/YYYY
        else if (/^\d{2}\/\d{2}\/\d{4}/.test(fechaStr)) {
          const [dd, m, y] = fechaStr.split('/');
          d = new Date(Number(y), Number(m) - 1, Number(dd));
        } 
        // Otros formatos (ISO completo, etc.)
        else {
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
      
      if (d instanceof Date && isNaN(d.getTime())) {
      }
      
      return d;
    };
    filtradas = filtradas.filter((p) => {
      const fechaPropuesta = p.creado_en;
      
      const fechaPropuestaObj = parseFecha(fechaPropuesta);
      
      // Si no hay filtro de fecha, no descartar nada
      if (!filtros.fechaInicio && !filtros.fechaFin) {
        return true;
      }
      
      if (!fechaPropuestaObj || isNaN(fechaPropuestaObj.getTime())) {
        return true;
      }

      let incluir = true;
      
      if (filtros.fechaInicio) {
        const fIni = parseFecha(filtros.fechaInicio);
        if (fIni && fechaPropuestaObj < fIni) {
          incluir = false;
        }
      }
      
      if (filtros.fechaFin && incluir) {
        const fFin = parseFecha(filtros.fechaFin, true);
        if (fFin && fechaPropuestaObj > fFin) {
          incluir = false;
        }
      }      
      return incluir;
    });
    if (filtros.estados.length > 0) {
      filtradas = filtradas.filter(p => {
        return filtros.estados.includes(p.estado_propuesta);
      });
    }

    if (filtros.carteras.length > 0) {
      filtradas = filtradas.filter(p => {
        const match = (p.carteras || []).some(c => filtros.carteras.includes(c));
        return match;
      });
    }

    if (busquedaNombre.trim()) {
      const q = busquedaNombre.trim().toLowerCase();
      filtradas = filtradas.filter(p => p.nombre.toLowerCase().includes(q));
    }

    setPropuestasFiltradas(filtradas);
  }, [propuestas, filtros, busquedaNombre, currentUser, currentRole, filtrarPorRol]);

  const handleNuevaPropuesta = (nuevaPropuesta) => {
    setPropuestas(prev => [nuevaPropuesta, ...prev]);
  };

  const handleEntrarPropuesta = (propuesta) => {
    if (currentRole === 'Administrador') {
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
    if (rol === 'DAF - Subdirector' && propuesta.estado_propuesta === ESTADOS.PRECONCILIADA) {
      // Usar automáticamente el id_usuario del supervisor (id_usuario: 1)
      ruta = `/propuesta/DAF - Supervisor/PRECONCILIADA/${propuesta.id_propuesta}?id_usuario=1`;
    } else if(rol === 'DAF - Subdirector' && propuesta.estado_propuesta === ESTADOS.GENERADA){
      // Usar automáticamente el id_usuario del supervisor (id_usuario: 1)
      ruta = `/propuesta/DAF - Supervisor/GENERADA/${propuesta.id_propuesta}?id_usuario=1`;
    } else if (rol === 'DAF - Subdirector' && propuesta.estado_propuesta === ESTADOS.AUTORIZACION) {
      // Usar automáticamente el id_usuario del supervisor (id_usuario: 1)
      ruta = `/propuesta/DAF - Supervisor/AUTORIZACION/${propuesta.id_propuesta}?id_usuario=1`;
    } else {
      ruta = `/propuesta/${rol}/${propuesta.estado_propuesta}/${propuesta.id_propuesta}`;
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
          p.id_propuesta === propuesta.id_propuesta
            ? { ...p, estado_propuesta: 'CANCELADO', fecha_actualizacion: new Date() }
            : p
        )
      );
    }
  };

  // Añadir un log para depuración

  const propuestasAbiertas = propuestasFiltradas.filter(p => {
    return ['PROGRAMADA',"PRECONCILIADA", 'GENERADA', 'APROBACION'].includes(p.estado_propuesta);
  });
  const propuestasConciliacion = propuestasFiltradas.filter(p =>
    p.estado_propuesta === 'CONCILIADA'
  );
  const propuestasCanceladas = propuestasFiltradas.filter(p =>
    p.estado_propuesta === 'CANCELADA'
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

        {loadingPermisos ? (
          <div className="text-center text-gray-500 py-8">Cargando permisos...</div>
        ) : (
          <>
            {activeTab === 'abiertas' && (
              <>
                <TablaPropuestas
                  titulo="Abiertas"
                  propuestas={propuestasAbiertas}
                  currentRole={currentRole}
                  matrizPermisos={matrizPermisos}
                  onEntrar={handleEntrarPropuesta}
                  onCancelar={handleCancelarPropuesta}
                />
              </>
            )}
            {activeTab === 'conciliadas' && (
              <>
                <TablaPropuestas
                  titulo="Conciliadas"
                  propuestas={propuestasConciliacion}
                  currentRole={currentRole}
                  matrizPermisos={matrizPermisos}
                  onEntrar={handleEntrarPropuesta}
                  onVer={handleVerPropuesta}
                  onCancelar={handleCancelarPropuesta}
                />
              </>
            )}
            {activeTab === 'canceladas' && (
              <>
                <TablaPropuestas
                  titulo="Canceladas"
                  propuestas={propuestasCanceladas}
                  currentRole={currentRole}
                  matrizPermisos={matrizPermisos}
                  onEntrar={handleEntrarPropuesta}
                  onVer={handleVerPropuesta}
                  showMotivoCancelacion
                />
              </>
            )}
          </>
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
