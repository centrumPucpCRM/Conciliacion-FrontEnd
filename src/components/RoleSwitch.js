import React from 'react';
// import { ROLES } from '../utils/mockData';
import { useRole } from '../context/RoleContext';

const RoleSwitch = () => {
  const {
    currentUser,
    changeUser,
    currentRole,
    changeRole,
    rolesUsuarios
  } = useRole();

  // Obtener el rol seleccionado desde rolesUsuarios
  const selectedRoleObj = rolesUsuarios.find(r => r.nombre === currentRole);
  const usuariosDelRol = selectedRoleObj ? selectedRoleObj.usuarios : [];

  const handleRoleChange = (e) => {
    changeRole(e.target.value);
    // La función changeRole ya se encarga de seleccionar automáticamente 
    // el primer usuario del nuevo rol si existe
  };

  // Cambiar usuario seleccionado para el rol actual
  const handleUserChange = (e) => {
    const user = usuariosDelRol.find(u => String(u.id_usuario) === e.target.value);
    if (user) {
      changeUser(user, currentRole);
    }
  };

  return (
    <div>
      <label className="font-semibold text-gray-700"> Rol: </label>
      <select
        className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
        value={currentRole}
        onChange={handleRoleChange}
      >
        {rolesUsuarios.map(rol => (
          <option key={rol.id_rol} value={rol.nombre}>{rol.nombre}</option>
        ))}
      </select>
      {usuariosDelRol.length > 0 && (
        <>
          <label className="font-semibold text-gray-700"> Usuario: </label>
          <select
            className="px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
            value={currentUser ? currentUser.id_usuario : ''}
            onChange={handleUserChange}
          >
            {usuariosDelRol.map(u => (
              <option key={u.id_usuario} value={u.id_usuario}>{u.nombres}</option>
            ))}
          </select>
        </>
      )}
      {usuariosDelRol.length === 0 && (
        <span className="ml-2 text-gray-500">No hay usuarios para este rol</span>
      )}
    </div>
  );
};

export default RoleSwitch;
