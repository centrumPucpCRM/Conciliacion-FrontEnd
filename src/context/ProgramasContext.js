import React, { createContext, useContext, useState } from 'react';
import { CARTERAS, generarProgramasPorCartera } from '../utils/mockData';

const ProgramasContext = createContext();

export const useProgramas = () => {
  const context = useContext(ProgramasContext);
  if (!context) {
    throw new Error('useProgramas debe ser usado dentro de un ProgramasProvider');
  }
  return context;
};

export const ProgramasProvider = ({ children }) => {
  // Generar programas para todas las carteras actuales
  const [programas, setProgramas] = useState(generarProgramasPorCartera(CARTERAS));
  // Estado: { [programaId]: { [jpId]: true/false } }
  const [refutarPorJP, setRefutarPorJP] = useState({});

  return (
    <ProgramasContext.Provider value={{ programas, setProgramas, refutarPorJP, setRefutarPorJP }}>
      {children}
    </ProgramasContext.Provider>
  );
};
