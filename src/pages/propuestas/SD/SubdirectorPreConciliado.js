import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRole } from '../../../context/RoleContext';

const statusColors = {
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800',
};

function StatusBadge({ status }) {
  const color = statusColors[status?.toUpperCase()] || statusColors.default;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{status}</span>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-4 border border-gray-100 hover:shadow-lg transition-shadow">
      {children}
    </div>
  );
}

const SubdirectorPreConciliado = () => {
  const { propuestaId } = useParams();
  const { currentUser } = useRole();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [solicitudesOportunidad, setSolicitudesOportunidad] = useState([]);
  const [solicitudesPrograma, setSolicitudesPrograma] = useState([]);
  const [solicitudesGenerales, setSolicitudesGenerales] = useState([]);

  useEffect(() => {
    if (!propuestaId || !currentUser) return;
    setIsLoading(true);
    const url = `http://localhost:8000/solicitudes-pre-conciliacion/propuesta/${propuestaId}/usuario/${currentUser.id_usuario}`;
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        return response.json();
      })
      .then(data => {
        setSolicitudesOportunidad(Array.isArray(data.solicitudesPropuestaOportunidad) ? data.solicitudesPropuestaOportunidad : []);
        setSolicitudesPrograma(Array.isArray(data.solicitudesPropuestaPrograma) ? data.solicitudesPropuestaPrograma : []);
        setSolicitudesGenerales(Array.isArray(data.solicitudesGenerales) ? data.solicitudesGenerales : []);
        setError(null);
        setIsLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar las solicitudes. Por favor, intente nuevamente.');
        setIsLoading(false);
      });
  }, [currentUser, propuestaId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-900">Solicitudes Generales de Pre-Conciliación</h1>

        {isLoading && (
          <div className="flex flex-col items-center py-16">
            <svg className="animate-spin h-8 w-8 text-blue-400 mb-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            <span className="text-blue-700 font-medium">Cargando solicitudes...</span>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center py-4 font-semibold">{error}</div>
        )}

        {!isLoading && !error && (
          <section>
            <h3 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Solicitudes Generales
            </h3>
            {solicitudesGenerales.length === 0 ? (
              <div className="text-gray-400 italic">No hay solicitudes generales.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {solicitudesGenerales.map(s => {
                  const isAbierta = s.abierta === 1 || s.abierta === true;
                  return (
                    <Card key={s.id_solicitud}>
                      <div className={`flex flex-col gap-1 ${isAbierta ? 'opacity-60 bg-gray-100' : 'bg-green-50 border-green-200'} p-2 rounded-lg transition-all`}> 
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-blue-700">Tipo: {s.tipo_solicitud}</span>
                          <span className="ml-auto"><StatusBadge status={s.valor_solicitud} /></span>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">{s.comentario}</div>
                        <div className="text-xs text-gray-400">{new Date(s.creado_en).toLocaleString()}</div>
                        {isAbierta ? (
                          <div className="mt-2 text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                            <span>Bloqueada (abierta)</span>
                          </div>
                        ) : (
                          <div className="mt-2 text-xs font-semibold text-green-700 flex items-center gap-1">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            <span>Cerrada</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default SubdirectorPreConciliado;
