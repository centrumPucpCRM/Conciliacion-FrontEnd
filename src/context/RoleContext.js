import React, { createContext, useContext, useState } from 'react';
import { ROLES, USUARIOS_JP, USUARIOS_SUBDIRECTOR } from '../utils/mockData';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole debe ser usado dentro de un RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(ROLES.ADMINISTRADOR);
  const [currentUserJP, setCurrentUserJP] = useState(USUARIOS_JP[0]);
  const [currentUserSubdirector, setCurrentUserSubdirector] = useState(USUARIOS_SUBDIRECTOR[0]);

  const changeRole = (newRole) => {
    setCurrentRole(newRole);
  };

  const value = {
    currentRole,
    changeRole,
    currentUserJP,
    setCurrentUserJP,
    currentUserSubdirector,
    setCurrentUserSubdirector
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
