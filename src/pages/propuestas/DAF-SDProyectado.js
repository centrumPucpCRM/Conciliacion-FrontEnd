import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha } from '../../utils/mockData';
import { usePropuestas } from '../../context/PropuestasContext';
import { useProgramas } from '../../context/ProgramasContext';

const DAFSDProyectado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();
  const { propuestas } = usePropuestas();
  const { programas } = useProgramas();
  const [expanded, setExpanded] = useState({}); // { [programaId]: true/false }

  const propuesta = propuestas.find(p => p.id === propuestaId) || {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'proyectado',
    carteras: [],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  // Filtrar programas solo de las carteras de la propuesta
  const programasFiltrados = programas.filter(p => propuesta.carteras.includes(p.cartera));

  const toggleExpand = (programaId) => {
    setExpanded(prev => ({ ...prev, [programaId]: !prev[programaId] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      {/* Header */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <button 
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              onClick={() => navigate('/main/propuestas')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a Propuestas</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-medium">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Programas Proyectados - DAF-SD</h1>
                <p className="text-gray-600 text-sm">Estado final de programas proyectados</p>
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-medium">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

        {/* Grilla de programas proyectados */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Programas Proyectados</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
              <colgroup>
                <col style={{ width: '10%' }} />   {/* Cartera */}
                <col style={{ width: '20%' }} />   {/* Programa */}
                <col style={{ width: '8%' }} />    {/* Meta Venta */}
                <col style={{ width: '8%' }} />    {/* Meta Alumnos */}
                <col style={{ width: '8%' }} />    {/* Alumnos Reales */}
                <col style={{ width: '10%' }} />   {/* Monto Real */}
                <col style={{ width: '8%' }} />    {/* Punto mínimo */}
                <col style={{ width: '8%' }} />    {/* En riesgo */}
                <col style={{ width: '20%' }} />   {/* Estado */}
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
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {programasFiltrados.map((programa) => {
                  const matriculados = programa.personas.filter(p => p.estado === 'matriculado');
                  const enRiesgo = matriculados.length < programa.minimo_apertura;
                  const estadoPrograma = programa.cancelar ? 'Cancelado' : 'Proyectado';
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
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${programa.cancelar ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                            {estadoPrograma}
                          </span>
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
                                    <th className="px-2 py-1 text-left">Moneda</th>
                                    <th className="px-2 py-1 text-left">Fecha de Matrícula</th>
                                    <th className="px-2 py-1 text-left">Estado</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {matriculados.length === 0 ? (
                                    <tr>
                                      <td colSpan={6} className="text-center text-gray-500 py-2">Sin matriculados</td>
                                    </tr>
                                  ) : (
                                    matriculados.map((m) => (
                                      <tr key={m.identificador}>
                                        <td className="px-2 py-1 font-mono">{m.identificador}</td>
                                        <td className="px-2 py-1 text-xs">{m.alumno || 'N/A'}</td>
                                        <td className="px-2 py-1">
                                          <span>S/ {m.monto}</span>
                                        </td>
                                        <td className="px-2 py-1">{m.moneda}</td>
                                        <td className="px-2 py-1">{m.fecha_estado}</td>
                                        <td className="px-2 py-1">
                                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">Proyectado</span>
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

        {/* Mensaje de estado final */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-purple-800 mb-2">Propuesta Completada</h3>
          <p className="text-purple-600">Esta propuesta ha alcanzado su estado final de proyección.</p>
        </div>
      </div>
    </div>
  );
};

export default DAFSDProyectado;
