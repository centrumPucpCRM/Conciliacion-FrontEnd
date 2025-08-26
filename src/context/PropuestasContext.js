import React, { createContext, useContext, useState } from 'react';
import { generarPropuestasPrueba } from '../utils/mockData';

const PropuestasContext = createContext();

export const usePropuestas = () => {
  const context = useContext(PropuestasContext);
  if (!context) {
    throw new Error('usePropuestas debe ser usado dentro de un PropuestasProvider');
  }
  return context;
};

export const PropuestasProvider = ({ children }) => {
  const [propuestas, setPropuestas] = useState(generarPropuestasPrueba());

  return (
    <PropuestasContext.Provider value={{ propuestas, setPropuestas }}>
      {children}
    </PropuestasContext.Provider>
  );
};
