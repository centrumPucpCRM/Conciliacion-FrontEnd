import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../components/Principal/MainHeader";
import { useRole } from "../context/RoleContext";
import { usePropuestas } from "../context/PropuestasContext";

const ESTADOS_ABIERTOS = ["GENERADA", "PROGRAMADA", "PRECONCILIADA", "APROBACION"];

const PaginaPrincipal = () => {
  const navigate = useNavigate();
  const { currentUser, rolesUsuarios } = useRole();
  const { propuestas } = usePropuestas();

  const getCurrentTime = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return "Buenos dias";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const stats = useMemo(() => {
    const total = propuestas.length;
    const conciliadas = propuestas.filter((p) => p.estado_propuesta === "CONCILIADA").length;
    const canceladas = propuestas.filter((p) => p.estado_propuesta === "CANCELADA").length;
    const abiertas = propuestas.filter((p) => ESTADOS_ABIERTOS.includes(p.estado_propuesta)).length;
    const aprobacion = propuestas.filter((p) => p.estado_propuesta === "APROBACION").length;

    return {
      total,
      conciliadas,
      canceladas,
      abiertas,
      aprobacion,
      avance: total ? Math.round((conciliadas / total) * 100) : 0,
    };
  }, [propuestas]);

  const estadosDistribution = useMemo(() => {
    const counts = propuestas.reduce((acc, propuesta) => {
      const key = propuesta.estado_propuesta || "SIN ESTADO";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries;
  }, [propuestas]);

  const conciliadasPorMes = useMemo(() => {
    const map = new Map();
    propuestas.forEach((propuesta) => {
      if (propuesta.estado_propuesta !== "CONCILIADA" || !propuesta.creado_en) {
        return;
      }
      const fecha = new Date(propuesta.creado_en);
      if (Number.isNaN(fecha.getTime())) return;
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    const formatter = new Intl.DateTimeFormat("es-PE", { month: "short" });
    const data = Array.from(map.entries())
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const label = `${formatter.format(new Date(Number(year), Number(month) - 1)).replace(".", "")} ${year.slice(-2)}`;
        return { key, label, value };
      })
      .sort((a, b) => (a.key < b.key ? -1 : 1));
    return data.slice(-6);
  }, [propuestas]);

  const maxConciliadasMes = Math.max(1, ...conciliadasPorMes.map((item) => item.value));

  const tarjetaResumen = [
    {
      label: "Propuestas activas",
      value: stats.abiertas,
      variante: "bg-sky-50 text-sky-600",
      detalle: `${stats.aprobacion} en aprobacion`
    },
    {
      label: "Conciliadas",
      value: stats.conciliadas,
      variante: "bg-emerald-50 text-emerald-600",
      detalle: `${stats.avance}% del total`
    },
    {
      label: "Canceladas",
      value: stats.canceladas,
      variante: "bg-rose-50 text-rose-600",
      detalle: `${stats.total ? Math.round((stats.canceladas / stats.total) * 100) : 0}% del total`
    },
    {
      label: "Total cargadas",
      value: stats.total,
      variante: "bg-slate-100 text-slate-600",
      detalle: `Usuario actual: ${currentUser?.nombres ?? "-"}`
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <MainHeader />
      <div className="px-0 py-6 sm:px-4 lg:px-8">
        <div className="mb-6 flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-slate-800">
            {getCurrentTime()}, {rolesUsuarios.length === 0 ? "Cargando usuario..." : currentUser ? currentUser.nombres : "Usuario"}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tarjetaResumen.map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${card.variante}`}>
                {card.label}
              </div>
              <p className="mt-4 text-3xl font-semibold text-slate-800">{card.value}</p>
              <p className="mt-2 text-sm text-slate-500">{card.detalle}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-700">Distribucion por estado</h3>
                <p className="text-xs text-slate-400">Cantidad de propuestas por estado actual</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/main/propuestas")}
                className="text-xs font-semibold text-sky-500 hover:text-sky-600"
              >
                Ver propuestas
              </button>
            </header>
            <div className="space-y-3">
              {estadosDistribution.length === 0 && (
                <p className="text-sm text-slate-400">No se encontraron propuestas registradas.</p>
              )}
              {estadosDistribution.map(([estado, cantidad]) => {
                const porcentaje = stats.total ? Math.round((cantidad / stats.total) * 100) : 0;
                return (
                  <div key={estado}>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-600">{estado}</span>
                      <span>{cantidad} ({porcentaje}%)</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-400"
                        style={{ width: `${stats.total ? Math.max(8, (cantidad / stats.total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <header className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-700">Conciliaciones ultimos meses</h3>
                <p className="text-xs text-slate-400">Propuestas conciliadas por mes (max 6 meses)</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/main/conciliaciones")}
                className="text-xs font-semibold text-sky-500 hover:text-sky-600"
              >
                Ver conciliaciones
              </button>
            </header>
            <div className="flex h-48 items-end gap-3">
              {conciliadasPorMes.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                  No hay conciliaciones registradas recientemente.
                </div>
              ) : (
                conciliadasPorMes.map((item) => (
                  <div key={item.key} className="flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t-lg bg-emerald-400/80"
                      style={{ height: `${Math.max(8, (item.value / maxConciliadasMes) * 100)}%` }}
                    />
                    <span className="mt-2 text-xs font-medium text-slate-500">{item.label}</span>
                    <span className="text-xs text-slate-400">{item.value}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PaginaPrincipal;
