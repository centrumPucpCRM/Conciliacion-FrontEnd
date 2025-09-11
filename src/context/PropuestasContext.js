import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchPropuestas } from '../utils/api';

const PropuestasContext = createContext();

export const usePropuestas = () => {
  const context = useContext(PropuestasContext);
  if (!context) {
    throw new Error('usePropuestas debe ser usado dentro de un PropuestasProvider');
  } 
  return context;
};

export const PropuestasProvider = ({ children }) => {
  const [propuestas, setPropuestas] = useState([]);

  useEffect(() => {
    let mounted = true;
    fetchPropuestas().then(data => {
      if (mounted) setPropuestas(data);
    }).catch(() => {
      if (mounted) setPropuestas([]);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <PropuestasContext.Provider value={{ propuestas, setPropuestas }}>
      {children}
    </PropuestasContext.Provider>
  );
};
