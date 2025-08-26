import React from 'react';
import { ROLES, USUARIOS_JP, USUARIOS_SUBDIRECTOR } from '../utils/mockData';
import { useRole } from '../context/RoleContext';

const RoleSwitch = () => {
  const {
    currentRole,
    changeRole,
    currentUserJP,
    setCurrentUserJP,
    currentUserSubdirector,
    setCurrentUserSubdirector
  } = useRole();

  const handleRoleChange = (e) => {
    changeRole(e.target.value);
  };

  const handleJPChange = (e) => {
    const user = USUARIOS_JP.find(jp => jp.id === e.target.value);
    setCurrentUserJP(user);
  };

  const handleSubChange = (e) => {
    const user = USUARIOS_SUBDIRECTOR.find(sub => sub.id === e.target.value);
    setCurrentUserSubdirector(user);
  };

  return (
    <div className="flex items-center space-x-4 justify-end p-4">
      <label className="font-semibold text-gray-700">Rol:</label>
      <select
        className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
        value={currentRole}
        onChange={handleRoleChange}
      >
        <option value={ROLES.ADMINISTRADOR}>Administrador</option>
        <option value={ROLES.DAF}>DAF</option>
        <option value={ROLES.JP}>JP</option>
        <option value={ROLES.SUBDIRECTOR}>Subdirector</option>
      </select>
      {currentRole === ROLES.JP && (
        <>
          <label className="font-semibold text-gray-700">Usuario JP:</label>
          <select
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
            value={currentUserJP.id}
            onChange={handleJPChange}
          >
            {USUARIOS_JP.map(jp => (
              <option key={jp.id} value={jp.id}>{jp.nombre}</option>
            ))}
          </select>
          <span className="ml-2 text-gray-600">({currentUserJP.nombre})</span>
        </>
      )}
      {currentRole === ROLES.SUBDIRECTOR && (
        <>
          <label className="font-semibold text-gray-700">Usuario Subdirector:</label>
          <select
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
            value={currentUserSubdirector.id}
            onChange={handleSubChange}
          >
            {USUARIOS_SUBDIRECTOR.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.nombre}</option>
            ))}
          </select>
          <span className="ml-2 text-gray-600">({currentUserSubdirector.nombre})</span>
        </>
      )}
    </div>
  );
};

export default RoleSwitch;
