import React, { createContext, useContext, useState } from 'react';

const ConciliacionContext = createContext();

export const useConciliacion = () => useContext(ConciliacionContext);

export const ConciliacionProvider = ({ children }) => {
  const [mesConciliacion, setMesConciliacion] = useState(null); // {date: Date, texto: 'Agosto 2025'}

  return (
    <ConciliacionContext.Provider value={{ mesConciliacion, setMesConciliacion }}>
      {children}
    </ConciliacionContext.Provider>
  );
};
