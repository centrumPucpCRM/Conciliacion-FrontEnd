import React, { useState } from "react";
import RoleSwitch from "../RoleSwitch";
import { useRole } from "../../context/RoleContext";

const NotificationPanel = ({ onClose }) => (
  <div className="absolute right-0 top-12 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Notificaciones recientes</h3>
        <p className="text-xs text-slate-400">Estas son tus ultimas actualizaciones.</p>
      </div>
      <button type="button" className="text-slate-400 hover:text-slate-600" onClick={onClose} aria-label="Cerrar notificaciones">
        ?
      </button>
    </div>
    <ul className="mt-3 space-y-2 text-sm text-slate-600">
      <li className="rounded-lg bg-slate-50 px-3 py-2">Propuesta 20250916 fue conciliada correctamente.</li>
      <li className="rounded-lg bg-slate-50 px-3 py-2">Nueva solicitud de aprobacion comercial asignada.</li>
      <li className="rounded-lg bg-slate-50 px-3 py-2">Recuerda revisar las conciliaciones del mes anterior.</li>
    </ul>
  </div>
);

const UserPanel = ({ user, onClose }) => (
  <div className="absolute right-0 top-12 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Perfil de usuario</h3>
        <p className="text-xs text-slate-400">Informacion de sesion actual.</p>
      </div>
      <button type="button" className="text-slate-400 hover:text-slate-600" onClick={onClose} aria-label="Cerrar panel de usuario">
        ?
      </button>
    </div>
    <div className="mt-3 space-y-2 text-sm text-slate-600">
      <p><span className="font-medium text-slate-700">Nombre:</span> {user?.nombres ?? "Usuario"}</p>
      <p><span className="font-medium text-slate-700">Correo:</span> {user?.correo ?? "—"}</p>
      <p><span className="font-medium text-slate-700">Rol activo:</span> {user?.rol ?? "—"}</p>
    </div>
    <div className="mt-4 flex gap-2">
      <button type="button" className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50">Ver perfil completo</button>
      <button type="button" className="flex-1 rounded-lg bg-sky-500 py-2 text-sm font-medium text-white transition hover:bg-sky-600">Cerrar sesion</button>
    </div>
  </div>
);

const PropuestasHeader = ({ onBack, titulo, showRoleSwitch = true }) => {
  const { currentUser } = useRole();
  const initialLetter = currentUser?.nombres?.charAt(0)?.toUpperCase() ?? "U";
  const [openPanel, setOpenPanel] = useState(null); // "notifications" | "user" | null

  const togglePanel = (panel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <header className="w-full">
      <div className="relative px-4 sm:px-4 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/95 text-slate-800 shadow-sm">
        <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50" onClick={onBack}>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Volver al inicio</span>
        </button>

        <div className="flex-1 min-w-[220px] text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800">{titulo}</h1>
        </div>

        <div className="flex items-center gap-3">
          {showRoleSwitch && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
              <RoleSwitch />
            </div>
          )}
          <div className="relative">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 shadow-sm transition hover:bg-slate-100"
              aria-label="Notificaciones"
              onClick={() => togglePanel("notifications")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            {openPanel === "notifications" && <NotificationPanel onClose={() => setOpenPanel(null)} />}
          </div>
          <div className="relative">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-sm font-semibold text-white shadow-sm"
              aria-label="Perfil de usuario"
              onClick={() => togglePanel("user")}
            >
              {initialLetter}
            </button>
            {openPanel === "user" && <UserPanel user={currentUser} onClose={() => setOpenPanel(null)} />}
          </div>
        </div>
      </div>
    </header>
  );
};

export default PropuestasHeader;
