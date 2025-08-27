import React from 'react';

const ProgramasGrillaDAF = ({
  programas,
  expanded,
  onToggleExpand,
  onToggleCancelar,
  onChangeMonto,
  onRevertMonto,
}) => {
  return (
    // Wrapper de página con mismo ancho/padding que el header
    <div className="mx-auto px-4 sm:px-6 lg:px-12">
      {/* Tarjeta */}
      <div className="bg-white  shadow-soft p-8 mb-8 border border-gray-200">

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[900px] text-sm">
            <colgroup>
              <col style={{ width: '10%' }} />   {/* Cartera */}
              <col style={{ width: '20%' }} />   {/* Programa */}
              <col style={{ width: '8%' }} />    {/* Meta Venta */}
              <col style={{ width: '8%' }} />    {/* Meta Alumnos */}
              <col style={{ width: '8%' }} />    {/* Alumnos Reales */}
              <col style={{ width: '10%' }} />   {/* Monto Real */}
              <col style={{ width: '15%' }} />    {/* Punto mínimo */}
              <col style={{ width: '8%' }} />    {/* En riesgo */}
              <col style={{ width: '20%' }} />   {/* No Aperturar */}
            </colgroup>

            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr className="align-middle">
                <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">Cartera</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 capitalize tracking-wider">Programa</th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">
                  <span>Meta<br/>Venta</span>
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">
                  <span className="block whitespace-normal leading-tight">Meta<br/>Alumnos</span>
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">
                  <span className="block whitespace-normal leading-tight">Alumnos<br/>Reales</span>
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">
                  <span className="block whitespace-normal leading-tight">Monto<br/>Real</span>
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">
                  <span className="block whitespace-normal leading-tight">Punto mínimo<br/>de apertura</span>
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider whitespace-nowrap">
                  En riesgo
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-600 capitalize tracking-wider">
                  <span className="block whitespace-normal leading-tight">No Aperturar<br/>(DAF)</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-400">
              {programas.map((programa) => {
                const matriculados = (programa.personas || []).filter(p => p.estado === 'matriculado');
                const enRiesgo = matriculados.length < (programa.minimo_apertura ?? 0);

                return (
                  <React.Fragment key={programa.id}>
                    <tr
                      className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => onToggleExpand(programa.id)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">{programa.cartera}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 leading-relaxed">{programa.nombre}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        S/ {programa.meta_venta?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {programa.meta_alumnos || '0'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {programa.alumnos_reales || matriculados.length}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        S/ {programa.monto_real?.toLocaleString() || '0'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-900">
                        {programa.minimo_apertura}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            enRiesgo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {enRiesgo ? 'En riesgo' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={!!programa.cancelar}
                          onChange={(e) => {
                            e.stopPropagation();
                            onToggleCancelar(programa.id);
                          }}
                          className="form-checkbox h-5 w-5 text-accent-orange focus:ring-accent-orange border-gray-300 rounded"
                        />
                      </td>
                    </tr>

                    {expanded[programa.id] && (
                      <tr>
                        <td colSpan={9} className="bg-purple-50 px-4 py-2">
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
                                {matriculados.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="text-center text-gray-500 py-2">Sin matriculados</td>
                                  </tr>
                                ) : (
                                  matriculados.map((m) => (
                                    <tr
                                      key={m.identificador}
                                      className={
                                        m.agregadoEnSesion || m.monto_editado_en_sesion
                                          ? 'bg-yellow-300 hover:bg-yellow-400 text-gray-900 transition-colors'
                                          : ''
                                      }
                                    >
                                      <td className="px-2 py-1 font-mono">{m.identificador}</td>
                                      <td className="px-2 py-1 text-xs">{m.alumno || 'N/A'}</td>
                                      <td className="px-2 py-1"><span>S/ {m.monto}</span></td>
                                      <td className="px-2 py-1">
                                        <input
                                          type="number"
                                          value={m.monto_propuesto || ''}
                                          onChange={(e) => onChangeMonto(programa.id, m.identificador, e.target.value)}
                                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-accent-orange"
                                          placeholder="0"
                                        />
                                      </td>
                                      <td className="px-2 py-1">{m.moneda}</td>
                                      <td className="px-2 py-1">{m.fecha_estado}</td>
                                      <td className="px-2 py-1">
                                        {m.agregadoEnSesion && (
                                          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                            Agregado en sesión
                                          </span>
                                        )}
                                        {m.monto_propuesto && m.monto_propuesto !== m.monto && (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onRevertMonto(programa.id, m.identificador);
                                            }}
                                            className="ml-2 px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                          >
                                            Revertir
                                          </button>
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
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramasGrillaDAF;
