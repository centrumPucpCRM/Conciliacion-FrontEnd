import React, { useState, useEffect, useCallback } from 'react';
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
import ModalSeleccionRol from '../components/ModalSeleccionRol';

const PaginaPropuestas = () => {
  const navigate = useNavigate();
  const { currentRole, currentUserJP, currentUserSubdirector } = useRole();
  const { propuestas, setPropuestas } = usePropuestas();

  const [propuestasFiltradas, setPropuestasFiltradas] = useState([]);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: ''
  });
  const [modalNuevaPropuesta, setModalNuevaPropuesta] = useState(false);
  const [modalSeleccionRol, setModalSeleccionRol] = useState(false);
  const [propuestaSeleccionada, setPropuestaSeleccionada] = useState(null);

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
    if (filtros.fechaInicio) {
      filtradas = filtradas.filter(p => new Date(p.fecha_creacion) >= new Date(filtros.fechaInicio));
    }
    if (filtros.fechaFin) {
      filtradas = filtradas.filter(p => new Date(p.fecha_creacion) <= new Date(filtros.fechaFin));
    }
    if (filtros.estado) {
      filtradas = filtradas.filter(p => p.estado === filtros.estado);
    }
    setPropuestasFiltradas(filtradas);
  }, [propuestas, filtros, currentRole, currentUserJP, currentUserSubdirector, filtrarPorRol]);

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      {/* Header sticky */}
      <div className="sticky top-0 z-30 bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <button 
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            onClick={() => navigate('/main')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver al Inicio</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-teal to-accent-green rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4m0 0V7a4 4 0 00-4-4H7a4 4 0 00-4 4v10a4 4 0 004 4h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Propuestas</h1>
              <p className="text-gray-600 text-sm">Administre todas las propuestas del sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="w-[99vw] box-border mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Filtros de Búsqueda</h3>
          </div>
          
          <div className="flex items-end space-x-6">
            <div className="space-y-2 flex-1">
              <label className="block text-sm font-medium text-gray-700">Fecha de Creación - Desde</label>
              <input
                type="date"
                name="fechaInicio"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                value={filtros.fechaInicio}
                onChange={handleFiltroChange}
              />
            </div>

            <div className="space-y-2 flex-1">
              <label className="block text-sm font-medium text-gray-700">Fecha de Creación - Hasta</label>
              <input
                type="date"
                name="fechaFin"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                value={filtros.fechaFin}
                onChange={handleFiltroChange}
              />
            </div>

            <div className="space-y-2 flex-1">
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                name="estado"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                value={filtros.estado}
                onChange={handleFiltroChange}
              >
                <option value="">Todos los estados</option>
                {Object.values(ESTADOS).map(estado => (
                  <option key={estado} value={estado}>
                    {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-shrink-0">
                              <button 
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium"
                  onClick={() => setModalNuevaPropuesta(true)}
                >
                  Nueva Propuesta
                </button>
            </div>
          </div>
        </div>

        {/* Grilla de Propuestas */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-indigo rounded-xl flex items-center justify-center shadow-medium">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Propuestas</h3>
                  <p className="text-gray-600 text-sm">{propuestasFiltradas.length} propuestas encontradas</p>
                </div>
              </div>
            </div>
          </div>
          
          {propuestasFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No se encontraron propuestas</h4>
              <p className="text-gray-500">Intente ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre de Propuesta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Propuesta
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Carteras
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {propuestasFiltradas.map(propuesta => (
                    <tr key={propuesta.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{propuesta.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatearFecha(propuesta.fecha_propuesta)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${obtenerColorEstado(propuesta.estado)}`}>
                          {propuesta.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {propuesta.carteras.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {tienePermiso(currentRole, propuesta.estado) && (
                            <button
                              className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 text-xs font-medium"
                              onClick={() => handleEntrarPropuesta(propuesta)}
                            >
                              Entrar
                            </button>
                          )}
                          
                          {tienePermiso(currentRole, propuesta.estado) && (
                          <button
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-xs font-medium"
                            onClick={() => handleVerPropuesta(propuesta)}
                          >
                            Ver
                          </button>
                          )}
                          
                          {puedeCancelar(currentRole) && propuesta.estado !== ESTADOS.CANCELADO && (
                            <button
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-xs font-medium"
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
          )}
        </div>
      </div>

      {/* Modales */}
      <ModalNuevaPropuesta
        isOpen={modalNuevaPropuesta}
        onClose={() => setModalNuevaPropuesta(false)}
        onPropuestaCreada={handleNuevaPropuesta}
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
