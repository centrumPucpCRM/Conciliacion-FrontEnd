import React, { createContext, useContext, useState } from 'react';
import { fetchCarteras, generarProgramasPorCartera } from '../utils/mockData';

const ProgramasContext = createContext();

export const useProgramas = () => {
  const context = useContext(ProgramasContext);
  if (!context) {
    throw new Error('useProgramas debe ser usado dentro de un ProgramasProvider');
  }
  return context;
};

export const ProgramasProvider = ({ children }) => {
  const [programas, setProgramas] = useState([]);
  const [refutarPorJP, setRefutarPorJP] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch carteras and generate programas when mounted
  React.useEffect(() => {
    let mounted = true;
    async function fetchAndGenerate() {
      setLoading(true);
      try {
        const carteras = await fetchCarteras();
        const progs = await generarProgramasPorCartera();
        if (mounted) setProgramas(progs);
      } catch {
        if (mounted) setProgramas([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAndGenerate();
    return () => { mounted = false; };
  }, []);

  return (
    <ProgramasContext.Provider value={{ programas, setProgramas, refutarPorJP, setRefutarPorJP, loading }}>
      {children}
    </ProgramasContext.Provider>
  );
};
