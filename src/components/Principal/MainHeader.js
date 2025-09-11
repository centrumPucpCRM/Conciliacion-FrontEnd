import React from 'react';

const MainHeader = () => {
  return (
    <header className="w-full bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl py-4
                      grid items-center gap-4
                      [grid-template-columns:1fr_auto_1fr]">
        {/* Izquierda: ícono */}
        <div>
          <p className="text-white text-xs">Centrum PUCP</p>
        </div>

        {/* Centro: título (siempre centrado) */}
        <div className="justify-self-center text-center">
          <h1 className="text-4xl font-bold tracking-wider">Sistema de Conciliación</h1>
        </div>

        {/* Derecha: “chip” TI (estilo RoleSwitch claro sobre fondo oscuro) */}
        <div className="justify-self-end">
          <div className="">
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
