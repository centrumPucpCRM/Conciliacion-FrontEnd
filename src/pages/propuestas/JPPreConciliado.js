import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha } from '../../utils/mockData';
import { usePropuestas } from '../../context/PropuestasContext';
import { useProgramas } from '../../context/ProgramasContext';
import { useRole } from '../../context/RoleContext';

const JPPreConciliado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();
  const { propuestas } = usePropuestas();
  const { programas, refutarPorJP, setRefutarPorJP, setProgramas } = useProgramas();
  const { currentUserJP } = useRole();
  const [expanded, setExpanded] = useState({}); // { [programaId]: true/false }
  const [modalAgregar, setModalAgregar] = useState({ open: false, programa: null });
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [busquedaCRM, setBusquedaCRM] = useState('');
  const [personaCRM, setPersonaCRM] = useState(null);
  const [editandoMonto, setEditandoMonto] = useState(null);
  const [montoPropuesto, setMontoPropuesto] = useState('');
  const [contrapropuesta, setContrapropuesta] = useState({}); // { [identificador]: string }


  const propuesta = propuestas.find(p => p.id === propuestaId) || {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'pre-conciliado',
    carteras: [],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  // Filtrar programas solo de las carteras del JP y de la propuesta
  const carterasJP = currentUserJP?.carteras || [];
  const programasFiltrados = programas.filter(p => propuesta.carteras.includes(p.cartera) && carterasJP.includes(p.cartera));

  // Estado de refutar para este JP
  const handleRefutarChange = (programaId) => {
    setRefutarPorJP(prev => ({
      ...prev,
      [programaId]: {
        ...prev[programaId],
        [currentUserJP.id]: !prev[programaId]?.[currentUserJP.id]
      }
    }));
  };

  const toggleExpand = (programaId) => {
    setExpanded(prev => ({ ...prev, [programaId]: !prev[programaId] }));
  };

  // Modal agregar personas
  const abrirModalAgregar = (programa) => {
    setModalAgregar({ open: true, programa });
    setBusqueda('');
    setSeleccionados([]);
  };
  const cerrarModalAgregar = () => {
    setModalAgregar({ open: false, programa: null });
    setBusqueda('');
    setSeleccionados([]);
    setBusquedaCRM('');
    setPersonaCRM(null);
  };
  const handleSeleccionar = (identificador) => {
    setSeleccionados(prev =>
      prev.includes(identificador)
        ? prev.filter(id => id !== identificador)
        : [...prev, identificador]
    );
  };
  const handleAgregarSeleccionados = () => {
    setProgramas(prev => prev.map(p => {
      if (p.id !== modalAgregar.programa.id) return p;
      return {
        ...p,
        personas: p.personas.map(persona =>
          seleccionados.includes(persona.identificador)
            ? {
                ...persona,
                estado: 'matriculado',
                fecha_estado: formatearFecha(new Date()),
                monto: (Math.random() * 10000 + 500).toFixed(2), // Primero generamos el monto
                monto_propuesto: null, // Lo inicializamos como null
                moneda: 'PEN',
                agregadoEnSesion: true
              }
            : persona
        ).map(persona => // Segundo paso: actualizar monto_propuesto
          seleccionados.includes(persona.identificador) && persona.monto
            ? {
                ...persona,
                monto_propuesto: persona.monto, // Ahora sí copiamos el monto al monto_propuesto
                monto_propuesto_daf: persona.monto
              }
            : persona
        )
      };
    }));
    cerrarModalAgregar();
  };

  const handleBuscarCRM = () => {
    if (!busquedaCRM.trim()) return;
    
    // Verificar si ya existe en el programa
    const existeEnPrograma = modalAgregar.programa.personas.some(p => p.identificador === busquedaCRM);
    
    if (existeEnPrograma) {
      alert('Esta persona ya existe en el programa');
      return;
    }
    
    // Generar nueva persona automáticamente
    const montoInicial = (Math.random() * 10000 + 500).toFixed(2);
    const nuevaPersona = {
      id: Date.now().toString(),
      identificador: busquedaCRM,
      estado: 'matriculado',
      fecha_estado: formatearFecha(new Date()),
      monto: montoInicial,
      monto_propuesto: montoInicial, // Inicializar monto propuesto igual al monto
      monto_propuesto_daf: montoInicial, // También inicializar el monto propuesto por DAF
      moneda: 'PEN',
      agregadoEnSesion: true
    };
    
    setPersonaCRM(nuevaPersona);
  };

  const handleAgregarCRM = () => {
    if (!personaCRM) return;
    
    setProgramas(prev => prev.map(p => {
      if (p.id !== modalAgregar.programa.id) return p;
      return {
        ...p,
        personas: [...p.personas, personaCRM]
      };
    }));
    
    setPersonaCRM(null);
    setBusquedaCRM('');
  };

  const iniciarEdicionMonto = (persona) => {
    setEditandoMonto(persona.identificador);
    setMontoPropuesto(persona.monto_propuesto || persona.monto);
  };

  const cancelarEdicionMonto = () => {
    setEditandoMonto(null);
    setMontoPropuesto('');
  };

  const guardarMontoPropuesto = (programaId, identificador) => {
    if (!montoPropuesto || isNaN(montoPropuesto)) return;
    
    setProgramas(prev => prev.map(p => {
      if (p.id !== programaId) return p;
      return {
        ...p,
        personas: p.personas.map(persona =>
          persona.identificador === identificador
            ? {
                ...persona,
                monto_inicial: persona.monto, // Guardar monto anterior
                monto_propuesto: montoPropuesto, // Guardar monto propuesto
                monto_editado_en_sesion: true, // Marcar como editado en sesión
                monto_editado_por_jp: true, // Marcar como editado por JP
                monto_editado_por_daf: false // Limpiar marca de edición por DAF
              }
            : persona
        )
      };
    }));
    
    setEditandoMonto(null);
    setMontoPropuesto('');
  };

  const revertirMontoPropuesto = (programaId, identificador) => {
    setProgramas(prev => prev.map(p => {
      if (p.id !== programaId) return p;
      return {
        ...p,
        personas: p.personas.map(persona => {
          if (persona.identificador !== identificador) return persona;
          // Si fue rechazado por JP, mantener amarillo y ticket
          if (persona.monto_daf_rechazado) {
            return {
              ...persona,
              monto_propuesto: persona.monto_propuesto_daf || persona.monto,
              monto_editado_en_sesion: true,
              monto_editado_por_jp: false,
              monto_contrapropuesto_por_jp: false,
              // Mantener monto_daf_rechazado: true
            };
          }
          // Si fue aceptado por JP, limpiar todo (no amarillo, no ticket)
          if (persona.monto_daf_aceptado_por_jp) {
            return {
              ...persona,
              monto_propuesto: persona.monto_propuesto_daf || persona.monto,
              monto_editado_en_sesion: false,
              monto_editado_por_jp: false,
              monto_contrapropuesta_por_jp: false,
              monto_daf_rechazado: false
            };
          }
          // Caso normal (edición JP, no DAF)
          return {
            ...persona,
            monto_propuesto: persona.monto_propuesto_daf || persona.monto,
            monto_editado_en_sesion: false,
            monto_editado_por_jp: false,
            monto_contrapropuesta_por_jp: false,
            monto_daf_rechazado: false
          };
        })
      };
    }));
  };

  const aceptarMontoDaf = (programaId, identificador) => {
    setProgramas(prev => prev.map(p => {
      if (p.id !== programaId) return p;
      return {
        ...p,
        personas: p.personas.map(persona =>
          persona.identificador === identificador
            ? {
                ...persona,
                monto_propuesto_daf: persona.monto_propuesto, // Guardar el monto propuesto por DAF
                monto_editado_en_sesion: false,
                monto_editado_por_daf: false,
                monto_editado_por_jp: false,
                monto_daf_aceptado_por_jp: true,
                monto_daf_rechazado: false
              }
            : persona
        )
      };
    }));
  };

  const rechazarMontoDaf = (programaId, identificador) => {
    setProgramas(prev => prev.map(p => {
      if (p.id !== programaId) return p;
      return {
        ...p,
        personas: p.personas.map(persona =>
          persona.identificador === identificador
            ? {
                ...persona,
                monto_daf_rechazado: true,
                monto_editado_en_sesion: true,
                monto_editado_por_daf: false,
                monto_contrapropuesto_por_jp: false,
                // Mantener el monto_propuesto_daf para poder revertir después
                monto_propuesto: persona.monto_propuesto_daf || persona.monto_propuesto
              }
            : persona
        )
      };
    }));
  };

  const confirmarContrapropuesta = (programaId, identificador) => {
    if (!contrapropuesta[identificador] || isNaN(contrapropuesta[identificador])) return;
    setProgramas(prev => prev.map(p => {
      if (p.id !== programaId) return p;
      return {
        ...p,
        personas: p.personas.map(persona =>
          persona.identificador === identificador
            ? {
                ...persona,
                monto_propuesto: contrapropuesta[identificador],
                monto_editado_en_sesion: true,
                monto_editado_por_jp: true,
                monto_editado_por_daf: false,
                monto_contrapropuesta_por_jp: true,
                monto_daf_rechazado: false
            }
            : persona
        )
      };
    }));

    setContrapropuesta(prev => ({ ...prev, [identificador]: '' }));
  };

  const handleSuprimirMatriculado = (programaId, identificador) => {
     setProgramas(prev => prev.map(p => {
       if (p.id !== programaId) return p;
       return {
         ...p,
         personas: p.personas.map(persona =>
           persona.identificador === identificador
             ? {
                 ...persona,
                 estado: 'interes', // Regresar al estado inicial
                 fecha_estado: formatearFecha(new Date()),
                 monto: '',
                 moneda: '',
                 agregadoEnSesion: false
               }
             : persona
         )
       };
     }));
   };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                onClick={() => navigate('/main/propuestas')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Volver a Propuestas</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Preparación de Conciliación</h1>
                <p className="text-gray-600 text-sm">Como JP, debe preparar la información para conciliación</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="w-[99vw] box-border mx-auto px-6 py-8">
        {/* Información de la propuesta */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-orange to-accent-red rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Información de la Propuesta</h2>
              <p className="text-gray-600">Detalles y configuración actual</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <p className="text-sm text-gray-900">{propuesta.nombre}</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fecha de Propuesta</label>
              <p className="text-sm text-gray-900">{formatearFecha(propuesta.fecha_propuesta)}</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Carteras</label>
              <p className="text-sm text-gray-900">{propuesta.carteras.join(', ')}</p>
            </div>
          </div>
        </div>



        {/* Grilla de programas */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Lista de Programas</h3>
                     <div className="overflow-x-auto w-full">
             <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '10%' }} />   {/* Cartera */}
                <col style={{ width: '35%' }} />   {/* Programa */}
                <col style={{ width: '6%' }} />    {/* Meta Venta */}
                <col style={{ width: '6%' }} />    {/* Meta Alumnos */}
                <col style={{ width: '6%' }} />    {/* Alumnos Reales */}
                <col style={{ width: '6%' }} />   {/* Monto Real */}
                <col style={{ width: '6%' }} />    {/* Punto mínimo */}
                <col style={{ width: '6%' }} />    {/* En riesgo */}
                <col style={{ width: '10%' }} />   {/* No Aperturar */}
                <col style={{ width: '10%' }} />   {/* Refutar */}
              </colgroup>
              <thead className="bg-gray-50">
                <tr className="align-middle">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cartera
                  </th> 
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programa
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="block whitespace-normal leading-tight">Meta<br/>Venta</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="block whitespace-normal leading-tight">Meta<br/>Alumnos</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="block whitespace-normal leading-tight">Alumnos<br/>Reales</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="block whitespace-normal leading-tight">Monto<br/>Real</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="block whitespace-normal leading-tight">Punto mínimo<br/>de apertura</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">En riesgo</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="block whitespace-normal leading-tight">No Aperturar<br/>(DAF)</span>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="block whitespace-normal leading-tight">Refutar<br/>(DAF)</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                                 {programasFiltrados.map((programa) => {
                   const matriculados = programa.personas.filter(p => p.estado === 'matriculado');
                   const enRiesgo = matriculados.length < programa.minimo_apertura;
                   const cancelar = programa.cancelar;
                   const refutar = refutarPorJP[programa.id]?.[currentUserJP.id] || false;
                   return (
                     <React.Fragment key={programa.id}>
                                               <tr 
                          className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                          onClick={() => toggleExpand(programa.id)}
                        >
                          <td className="px-4 py-3 text-sm text-gray-700">{programa.cartera}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 leading-relaxed">{programa.nombre}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">S/ {programa.meta_venta?.toLocaleString() || '0'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">{programa.meta_alumnos || '0'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">{programa.alumnos_reales || matriculados.length}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">S/ {programa.monto_real?.toLocaleString() || '0'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">{programa.minimo_apertura}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${enRiesgo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {enRiesgo ? 'En riesgo' : 'OK'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={cancelar}
                              readOnly
                              className="form-checkbox h-5 w-5 text-accent-orange border-gray-300 rounded cursor-not-allowed opacity-60"
                              tabIndex={-1}
                            />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              checked={refutar}
                              onChange={(e) => {
                                e.stopPropagation(); // Evitar que se expanda al hacer click en el checkbox
                                handleRefutarChange(programa.id);
                              }}
                              className="form-checkbox h-5 w-5 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                              disabled={!cancelar}
                            />
                          </td>
                        </tr>
                                             {expanded[programa.id] && (
                         <tr>
                           <td colSpan={9} className="bg-blue-50 px-4 py-2">
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
                                     <th className="px-2 py-1 text-center">Acciones</th>
                                   </tr>
                                 </thead>
                                <tbody>
                                                                                                        {matriculados.length === 0 ? (
                                     <tr>
                                       <td colSpan={7} className="text-center text-gray-500 py-2">Sin matriculados</td>
                                     </tr>
                                   ) : (
                                                                                matriculados.map((m) => (
                                           <tr key={m.identificador} className={
                                             m.agregadoEnSesion || m.monto_editado_en_sesion 
                                               ? 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 transition-colors' 
                                               : ''
                                           }>
                                             <td className="px-2 py-1 font-mono">{m.identificador}</td>
                                             <td className="px-2 py-1 text-xs">{m.alumno || 'N/A'}</td>
                                             <td className="px-2 py-1">
                                               <span>S/ {m.monto}</span>
                                             </td>
                                                                                       <td className="px-2 py-1">
                                              {editandoMonto === m.identificador && !m.monto_editado_por_daf && !m.monto_contrapropuesto_por_jp ? (
                                                <div className="flex items-center space-x-1">
                                                  <input
                                                    type="number"
                                                    className="w-20 px-1 py-0.5 text-xs border rounded"
                                                    value={montoPropuesto}
                                                    onChange={(e) => setMontoPropuesto(e.target.value)}
                                                    step="0.01"
                                                    min="0"
                                                  />
                                                  <button
                                                    className="text-green-600 hover:text-green-800 text-xs"
                                                    onClick={() => guardarMontoPropuesto(programa.id, m.identificador)}
                                                    title="Guardar"
                                                  >
                                                    ✓
                                                  </button>
                                                  <button
                                                    className="text-red-600 hover:text-red-800 text-xs"
                                                    onClick={cancelarEdicionMonto}
                                                    title="Cancelar"
                                                  >
                                                    ✕
                                                  </button>
                                                </div>
                                              ) : (
                                                                                                 <div 
                                                   className="cursor-pointer hover:bg-gray-100 rounded px-1"
                                                   onClick={() => iniciarEdicionMonto(m)}
                                                 >
                                                  {m.monto_propuesto ? (
                                                    <span className="text-purple-600 font-medium">S/ {m.monto_propuesto}</span>
                                                  ) : (
                                                    <span className="text-gray-400">-</span>
                                                  )}
                                                </div>
                                              )}
                                            </td>
                                           <td className="px-2 py-1">{m.moneda}</td>
                                           <td className="px-2 py-1">{m.fecha_estado}</td>
                                                                                       <td className="px-2 py-1 text-center">
                                              <div className="flex items-center justify-center space-x-1">
                                                {m.agregadoEnSesion && (
                                                  <button
                                                    className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200 font-semibold"
                                                    onClick={() => handleSuprimirMatriculado(programa.id, m.identificador)}
                                                    title="Eliminar matriculado"
                                                  >
                                                    Eliminar
                                                  </button>
                                                )}
                                                {m.monto_editado_por_jp && !m.monto_editado_por_daf && m.monto_propuesto && !m.monto_contrapropuesto_por_jp && (
                                                  <button
                                                    className="ml-2 px-2 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors duration-200"
                                                    onClick={() => revertirMontoPropuesto(programa.id, m.identificador)}
                                                    title="Revertir monto propuesto"
                                                  >
                                                    Revertir
                                                  </button>
                                                )}
                                                {m.monto_editado_por_daf && m.monto_propuesto && (
                                                  m.monto_daf_rechazado ? (
                                                    // Si fue rechazado, mostrar obligatoriamente input para monto alternativo
                                                    <div className="flex items-center space-x-1">
                                                      <input
                                                        type="number"
                                                        className="w-20 px-1 py-0.5 text-xs border rounded"
                                                        value={contrapropuesta[m.identificador] || m.monto_propuesto}
                                                        onChange={e => setContrapropuesta(prev => ({ ...prev, [m.identificador]: e.target.value }))}
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="Monto JP"
                                                      />
                                                      <button
                                                        className="text-green-600 hover:text-green-800 text-xs"
                                                        onClick={() => confirmarContrapropuesta(programa.id, m.identificador)}
                                                        title="Enviar contrapropuesta"
                                                      >✓</button>
                                                    </div>
                                                  ) : m.monto_daf_aceptado_por_jp ? (
                                                    // Si fue aceptado, mostrar solo el estado
                                                    <span className="text-green-600 text-xs font-medium">✓ Aceptado</span>
                                                  ) : (
                                                    // Si no se ha decidido, mostrar botones de aceptar/rechazar
                                                    <>
                                                      <button
                                                        className="ml-2 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200"
                                                        onClick={() => aceptarMontoDaf(programa.id, m.identificador)}
                                                        title="Aceptar monto DAF"
                                                      >Aceptar</button>
                                                      <button
                                                        className="ml-2 px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                                        onClick={() => rechazarMontoDaf(programa.id, m.identificador)}
                                                        title="Rechazar monto DAF"
                                                      >Rechazar</button>
                                                    </>
                                                  )
                                                )}
                                              </div>
                                            </td>
                                         </tr>
                                       ))
                                     )}
                                </tbody>
                              </table>
                            </div>
                            <button
                              className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                              onClick={() => abrirModalAgregar(programa)}
                            >Agregar</button>
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
      {/* Modal de agregar personas */}
      {modalAgregar.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Agregar personas a {modalAgregar.programa.nombre}</h2>
              <button onClick={cerrarModalAgregar} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="mb-4 space-y-4">
               {/* Búsqueda en lista existente */}
               <div className="flex items-center space-x-2">
                 <input
                   type="text"
                   className="px-3 py-2 border rounded-lg w-64"
                   placeholder="Buscar por identificador..."
                   value={busqueda}
                   onChange={e => setBusqueda(e.target.value)}
                 />
               </div>
               
               {/* Búsqueda en CRM */}
               <div className="border-t pt-4">
                 <h4 className="text-sm font-medium text-gray-700 mb-2">Buscar en CRM</h4>
                 <div className="flex items-center space-x-2">
                   <input
                     type="text"
                     className="px-3 py-2 border rounded-lg w-64"
                     placeholder="Ingrese identificador..."
                     value={busquedaCRM}
                     onChange={e => setBusquedaCRM(e.target.value)}
                   />
                   <button
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
                     onClick={handleBuscarCRM}
                   >
                     Buscar
                   </button>
                 </div>
                 
                 {personaCRM && (
                   <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm font-medium">Identificador: {personaCRM.identificador}</p>
                         <p className="text-xs text-gray-600">Nueva persona encontrada en CRM</p>
                       </div>
                       <button
                         className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold"
                         onClick={handleAgregarCRM}
                       >
                         Agregar
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </div>
            <div className="overflow-x-auto max-h-64">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left">Identificador</th>
                    <th className="px-2 py-1 text-left">Estado</th>
                    <th className="px-2 py-1 text-left">Fecha de estado</th>
                    <th className="px-2 py-1 text-center">Agregar</th>
                  </tr>
                </thead>
                <tbody>
                  {modalAgregar.programa.personas.filter(p => p.estado !== 'matriculado' && p.identificador.includes(busqueda)).map(p => (
                    <tr key={p.identificador}>
                      <td className="px-2 py-1 font-mono">{p.identificador}</td>
                      <td className="px-2 py-1">{p.estado}</td>
                      <td className="px-2 py-1">{p.fecha_estado}</td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(p.identificador)}
                          onChange={() => handleSeleccionar(p.identificador)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <button
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
                onClick={cerrarModalAgregar}
              >Cancelar</button>
              <button
                className="px-6 py-2 bg-accent-orange hover:bg-accent-red text-white rounded-lg font-semibold"
                onClick={handleAgregarSeleccionados}
                disabled={seleccionados.length === 0}
              >Agregar seleccionados</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JPPreConciliado;
