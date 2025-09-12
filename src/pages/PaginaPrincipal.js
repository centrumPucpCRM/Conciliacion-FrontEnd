import React from 'react';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import MainHeader from '../components/Principal/MainHeader';
import HomeModules from '../components/Principal/HomeModules';

const PaginaPrincipal = () => {
  const navigate = useNavigate();

  const handleNavigation = (ruta) => {
    navigate(ruta);
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const { currentUser, currentRole, rolesUsuarios } = useRole();
  // Usar directamente el currentUser unificado
  const usuarioActual = currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      {/* Header con estilo del ejemplo (bg gris oscuro + texto blanco) */}
      <MainHeader />

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Saludo */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {getCurrentTime()}, {rolesUsuarios.length === 0 ? 'Cargando usuario...' : (usuarioActual ? usuarioActual.nombres : 'USUARIO')}
          </h2>
          <p className="text-gray-600 text-lg">
            Seleccione el módulo que desea gestionar
          </p>
        </div>

        {/* Navegación principal */}
        <HomeModules onNavigate={handleNavigation} />
      </div>
    </div>
  );
};

export default PaginaPrincipal;
