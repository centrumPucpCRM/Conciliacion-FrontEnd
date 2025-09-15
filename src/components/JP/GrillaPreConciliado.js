// components/JP/GrillaPreConciliado.jsx
import React, { useState } from 'react';
import { useProgramas } from '../../context/ProgramasContext';
import { useRole } from '../../context/RoleContext';
import { formatearFecha } from '../../utils/mockData';

const money = (v) => `${(v ?? 0).toLocaleString()}`;

export default function GrillaPreConciliado({ programas = [] }) {
  const { refutarPorJP, setRefutarPorJP, setProgramas } = useProgramas();
  const { currentUser } = useRole();

  // UI state
  const [expanded, setExpanded] = useState({}); // { [programaId]: boolean }
  const [modalAgregar, setModalAgregar] = useState({ open: false, programa: null });
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);
  const [busquedaCRM, setBusquedaCRM] = useState('');
  const [personaCRM, setPersonaCRM] = useState(null);
  const [editandoMonto, setEditandoMonto] = useState(null);
  const [montoPropuesto, setMontoPropuesto] = useState('');
  const [contrapropuesta, setContrapropuesta] = useState({}); // { [identificador]: string }

  const toggleExpand = (programaId) => {
    setExpanded((prev) => ({ ...prev, [programaId]: !prev[programaId] }));
  };

  // --- Refutar ---
  const handleRefutarChange = (programaId) => {
    if (!currentUser?.id_usuario) return;
    setRefutarPorJP((prev) => ({
      ...prev,
      [programaId]: {
        ...prev[programaId],
        [currentUser.id_usuario]: !prev[programaId]?.[currentUser.id_usuario],
      },
    }));
  };

  // --- Modal Agregar ---
  const abrirModalAgregar = (programa) => {
    setModalAgregar({ open: true, programa });
    setBusqueda('');
    setSeleccionados([]);
    setBusquedaCRM('');
    setPersonaCRM(null);
  };

  const cerrarModalAgregar = () => {
    setModalAgregar({ open: false, programa: null });
    setBusqueda('');
    setSeleccionados([]);
    setBusquedaCRM('');
    setPersonaCRM(null);
  };

  const handleSeleccionar = (identificador) => {
    setSeleccionados((prev) =>
      prev.includes(identificador) ? prev.filter((id) => id !== identificador) : [...prev, identificador]
    );
  };

  const handleAgregarSeleccionados = () => {
    if (!modalAgregar.programa) return;
    setProgramas((prev) =>
      prev.map((p) => {
        if (p.id !== modalAgregar.programa.id) return p;
        return {
          ...p,
          personas: p.personas
            .map((persona) =>
              seleccionados.includes(persona.identificador)
                ? {
                    ...persona,
                    estado: 'matriculado',
                    fecha_estado: formatearFecha(new Date()),
                    monto: (Math.random() * 10000 + 500).toFixed(2),
                    monto_propuesto: null,
                    moneda: 'PEN',
                    agregadoEnSesion: true,
                  }
                : persona
            )
            .map((persona) =>
              seleccionados.includes(persona.identificador) && persona.monto
                ? {
                    ...persona,
                    monto_propuesto: persona.monto,
                    monto_propuesto_daf: persona.monto,
                  }
                : persona
            ),
        };
      })
    );
    cerrarModalAgregar();
  };

  // --- CRM ---
  const handleBuscarCRM = () => {
    if (!busquedaCRM.trim() || !modalAgregar.programa) return;

    const existe = modalAgregar.programa.personas.some((p) => p.identificador === busquedaCRM);
    if (existe) {
      alert('Esta persona ya existe en el programa');
      return;
    }

    const montoInicial = (Math.random() * 10000 + 500).toFixed(2);
    setPersonaCRM({
      id: Date.now().toString(),
      identificador: busquedaCRM,
      estado: 'matriculado',
      fecha_estado: formatearFecha(new Date()),
      monto: montoInicial,
      monto_propuesto: montoInicial,
      monto_propuesto_daf: montoInicial,
      moneda: 'PEN',
      agregadoEnSesion: true,
    });
  };

  const handleAgregarCRM = () => {
    if (!personaCRM || !modalAgregar.programa) return;
    setProgramas((prev) =>
      prev.map((p) => (p.id === modalAgregar.programa.id ? { ...p, personas: [...p.personas, personaCRM] } : p))
    );
    setPersonaCRM(null);
    setBusquedaCRM('');
  };

  // --- Edición de montos (JP) ---
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
    setProgramas((prev) =>
      prev.map((p) => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map((persona) =>
            persona.identificador === identificador
              ? {
                  ...persona,
                  monto_inicial: persona.monto,
                  monto_propuesto: montoPropuesto,
                  monto_editado_en_sesion: true,
                  monto_editado_por_jp: true,
                  monto_editado_por_daf: false,
                }
              : persona
          ),
        };
      })
    );
    setEditandoMonto(null);
    setMontoPropuesto('');
  };

  const revertirMontoPropuesto = (programaId, identificador) => {
    setProgramas((prev) =>
      prev.map((p) => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map((persona) => {
            if (persona.identificador !== identificador) return persona;
            if (persona.monto_daf_rechazado) {
              return {
                ...persona,
                monto_propuesto: persona.monto_propuesto_daf || persona.monto,
                monto_editado_en_sesion: true,
                monto_editado_por_jp: false,
                monto_contrapropuesto_por_jp: false,
              };
            }
            if (persona.monto_daf_aceptado_por_jp) {
              return {
                ...persona,
                monto_propuesto: persona.monto_propuesto_daf || persona.monto,
                monto_editado_en_sesion: false,
                monto_editado_por_jp: false,
                monto_contrapropuesta_por_jp: false,
                monto_daf_rechazado: false,
              };
            }
            return {
              ...persona,
              monto_propuesto: persona.monto_propuesto_daf || persona.monto,
              monto_editado_en_sesion: false,
              monto_editado_por_jp: false,
              monto_contrapropuesta_por_jp: false,
              monto_daf_rechazado: false,
            };
          }),
        };
      })
    );
  };

  const aceptarMontoDaf = (programaId, identificador) => {
    setProgramas((prev) =>
      prev.map((p) => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map((persona) =>
            persona.identificador === identificador
              ? {
                  ...persona,
                  monto_propuesto_daf: persona.monto_propuesto,
                  monto_editado_en_sesion: false,
                  monto_editado_por_daf: false,
                  monto_editado_por_jp: false,
                  monto_daf_aceptado_por_jp: true,
                  monto_daf_rechazado: false,
                }
              : persona
          ),
        };
      })
    );
  };

  const rechazarMontoDaf = (programaId, identificador) => {
    setProgramas((prev) =>
      prev.map((p) => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map((persona) =>
            persona.identificador === identificador
              ? {
                  ...persona,
                  monto_daf_rechazado: true,
                  monto_editado_en_sesion: true,
                  monto_editado_por_daf: false,
                  monto_contrapropuesto_por_jp: false,
                  monto_propuesto: persona.monto_propuesto_daf || persona.monto_propuesto,
                }
              : persona
          ),
        };
      })
    );
  };

  const confirmarContrapropuesta = (programaId, identificador) => {
    const valor = contrapropuesta[identificador];
    if (!valor || isNaN(valor)) return;
    setProgramas((prev) =>
      prev.map((p) => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          personas: p.personas.map((persona) =>
            persona.identificador === identificador
              ? {
                  ...persona,
                  monto_propuesto: valor,
                  monto_editado_en_sesion: true,
                  monto_editado_por_jp: true,
                  monto_editado_por_daf: false,
                  monto_contrapropuesta_por_jp: true,
                  monto_daf_rechazado: false,
                }
              : persona
          ),
        };
      })
    );
    setContrapropuesta((prev) => ({ ...prev, [identificador]: '' }));
  };

  return (
    <div className="box-border mx-auto px-12 py-4">
      <div className="mx-auto px-12 py-4 bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Lista de Programas</h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '10%' }} />
              <col style={{ width: '35%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>

            <thead className="bg-gray-50">
              <tr className="align-middle">
                <Th>Cartera</Th>
                <Th>Programa</Th>
                <Th center>Meta<br />Venta</Th>
                <Th center>Meta<br />Alumnos</Th>
                <Th center>Alumnos<br />Reales</Th>
                <Th center>Monto<br />Real</Th>
                <Th center>Punto mínimo<br />de apertura</Th>
                <Th center className="whitespace-nowrap">En riesgo</Th>
                <Th center>No Aperturar<br />(DAF)</Th>
                <Th center>Refutar<br />(DAF)</Th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {programas.map((programa) => {
                const personas = Array.isArray(programa.personas) ? programa.personas : [];
                const matriculados = personas.filter((p) => p.estado === 'matriculado');
                const enRiesgo = matriculados.length < (programa.minimo_apertura ?? 0);
                const cancelar = !!programa.cancelar;
                const refutar = !!refutarPorJP[programa.id]?.[currentUser?.id_usuario];

                return (
                  <React.Fragment key={programa.id}>
                    <tr
                      className="cursor-pointer hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => toggleExpand(programa.id)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">{programa.cartera}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 leading-relaxed">{programa.nombre}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{money(programa.meta_venta)}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{programa.meta_alumnos || '0'}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{programa.alumnos_reales || matriculados.length}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{money(programa.monto_real)}</td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">{programa.minimo_apertura}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${enRiesgo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {enRiesgo ? 'En riesgo' : 'OK'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={cancelar}
                          readOnly
                          className="form-checkbox h-5 w-5 text-accent-orange border-gray-300 rounded cursor-not-allowed opacity-60"
                          tabIndex={-1}
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={refutar}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleRefutarChange(programa.id)}
                          className="form-checkbox h-5 w-5 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                          disabled={!cancelar}
                        />
                      </td>
                    </tr>

                    {expanded[programa.id] && (
                      <tr>
                        {/* 10 columnas en el thead ⇒ colSpan={10} */}
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
                                      <td className="px-2 py-1"><span>{money(m.monto)}</span></td>

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
                                              <span className="text-purple-600 font-medium">{money(m.monto_propuesto)}</span>
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
                                              onClick={() =>
                                                setProgramas((prev) =>
                                                  prev.map((p) =>
                                                    p.id === programa.id
                                                      ? {
                                                          ...p,
                                                          personas: p.personas.map((persona) =>
                                                            persona.identificador === m.identificador
                                                              ? {
                                                                  ...persona,
                                                                  estado: 'interes',
                                                                  fecha_estado: formatearFecha(new Date()),
                                                                  monto: '',
                                                                  moneda: '',
                                                                  agregadoEnSesion: false,
                                                                }
                                                              : persona
                                                          ),
                                                        }
                                                      : p
                                                  )
                                                )
                                              }
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
                                              <div className="flex items-center space-x-1">
                                                <input
                                                  type="number"
                                                  className="w-20 px-1 py-0.5 text-xs border rounded"
                                                  value={contrapropuesta[m.identificador] || m.monto_propuesto}
                                                  onChange={(e) =>
                                                    setContrapropuesta((prev) => ({
                                                      ...prev,
                                                      [m.identificador]: e.target.value,
                                                    }))
                                                  }
                                                  step="0.01"
                                                  min="0"
                                                  placeholder="Monto JP"
                                                />
                                                <button
                                                  className="text-green-600 hover:text-green-800 text-xs"
                                                  onClick={() => confirmarContrapropuesta(programa.id, m.identificador)}
                                                  title="Enviar contrapropuesta"
                                                >
                                                  ✓
                                                </button>
                                              </div>
                                            ) : m.monto_daf_aceptado_por_jp ? (
                                              <span className="text-green-600 text-xs font-medium">✓ Aceptado</span>
                                            ) : (
                                              <>
                                                <button
                                                  className="ml-2 px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200"
                                                  onClick={() => aceptarMontoDaf(programa.id, m.identificador)}
                                                  title="Aceptar monto DAF"
                                                >
                                                  Aceptar
                                                </button>
                                                <button
                                                  className="ml-2 px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                                  onClick={() => rechazarMontoDaf(programa.id, m.identificador)}
                                                  title="Rechazar monto DAF"
                                                >
                                                  Rechazar
                                                </button>
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
                          >
                            Agregar
                          </button>
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

      {/* Modal de agregar personas */}
      {modalAgregar.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Agregar personas a {modalAgregar.programa?.nombre}
              </h2>
              <button
                onClick={cerrarModalAgregar}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="mb-4 space-y-4">
              {/* Búsqueda en lista existente */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  className="px-3 py-2 border rounded-lg w-64"
                  placeholder="Buscar por identificador..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
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
                    onChange={(e) => setBusquedaCRM(e.target.value)}
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
                        <p className="text-sm font-medium">
                          Identificador: {personaCRM.identificador}
                        </p>
                        <p className="text-xs text-gray-600">
                          Nueva persona encontrada en CRM
                        </p>
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
                  {(modalAgregar.programa?.personas || [])
                    .filter((p) => p.estado !== 'matriculado' && p.identificador.includes(busqueda))
                    .map((p) => (
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
              >
                Cancelar
              </button>
              <button
                className="px-6 py-2 bg-accent-orange hover:bg-accent-red text-white rounded-lg font-semibold"
                onClick={handleAgregarSeleccionados}
                disabled={seleccionados.length === 0}
              >
                Agregar seleccionados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  
const Th = ({ children, center = false, className = '' }) => (
  <th
    className={`px-4 py-3 ${center ? 'text-center' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    <span className="block whitespace-normal leading-tight">{children}</span>
  </th>
);
