import React, { useState, useEffect } from 'react';
import { useRole } from '../context/RoleContext';

const ModalSeleccionRol = ({ isOpen, onClose, onRolSeleccionado, propuesta }) => {
  const {
    rolesUsuarios,
    changeUser,
    currentUser
  } = useRole();

  const [rolSeleccionado, setRolSeleccionado] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [usuariosDelRol, setUsuariosDelRol] = useState([]);

  // Establecer valores iniciales cuando el componente se monta o rolesUsuarios cambia
  useEffect(() => {
    if (rolesUsuarios.length > 0) {
      // Establecer el primer rol como predeterminado si no hay uno seleccionado
      if (!rolSeleccionado) {
        setRolSeleccionado(rolesUsuarios[0].nombre);
        
        // Actualizar la lista de usuarios para el rol seleccionado
        const usuariosRol = rolesUsuarios[0].usuarios || [];
        setUsuariosDelRol(usuariosRol);
        
        // Seleccionar el primer usuario si hay alguno disponible
        if (usuariosRol.length > 0) {
          setUsuarioSeleccionado(String(usuariosRol[0].id_usuario));
        }
      }
    }
  }, [rolesUsuarios, rolSeleccionado]);

  const handleRolChange = (e) => {
    const nuevoRol = e.target.value;
    setRolSeleccionado(nuevoRol);
    
    // Buscar los usuarios que corresponden a este rol
    const rolObj = rolesUsuarios.find(r => r.nombre === nuevoRol);
    if (rolObj && rolObj.usuarios) {
      setUsuariosDelRol(rolObj.usuarios);
      
      // Seleccionar automáticamente el primer usuario
      if (rolObj.usuarios.length > 0) {
        setUsuarioSeleccionado(String(rolObj.usuarios[0].id_usuario));
      } else {
        setUsuarioSeleccionado('');
      }
    } else {
      setUsuariosDelRol([]);
      setUsuarioSeleccionado('');
    }
  };

  const handleUsuarioChange = (e) => {
    setUsuarioSeleccionado(e.target.value);
  };

  const handleContinuar = () => {
    // Buscar el objeto de usuario basado en el ID seleccionado
    const rolObj = rolesUsuarios.find(r => r.nombre === rolSeleccionado);
    if (rolObj && rolObj.usuarios) {
      const usuario = rolObj.usuarios.find(u => String(u.id_usuario) === usuarioSeleccionado);
      if (usuario) {
        // Utilizar la función unificada para cambiar el usuario y rol
        changeUser(usuario, rolSeleccionado);
      }
    }
    
    onRolSeleccionado(rolSeleccionado);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Seleccionar Rol</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="mb-4">
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">Propuesta:</span> {propuesta?.nombre}
          </div>
          <div className="mb-2 text-gray-700">
            <span className="font-semibold">Estado:</span> {propuesta?.estado}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold text-gray-700 mb-2">Seleccione con qué rol desea ver la propuesta:</label>
          <select
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
            value={rolSeleccionado}
            onChange={handleRolChange}
          >
            {rolesUsuarios.map(rol => (
              <option key={rol.id_rol} value={rol.nombre}>{rol.nombre}</option>
            ))}
          </select>
        </div>
        {usuariosDelRol.length > 0 && (
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">
              Seleccione el usuario:
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
              value={usuarioSeleccionado}
              onChange={handleUsuarioChange}
            >
              {usuariosDelRol.map(usuario => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombres}
                </option>
              ))}
            </select>
          </div>
        )}
        {usuariosDelRol.length === 0 && (
          <div className="mb-4 text-gray-500">
            No hay usuarios disponibles para este rol
          </div>
        )}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-6 py-2 bg-accent-orange hover:bg-accent-red text-white rounded-lg font-semibold"
            onClick={handleContinuar}
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionRol;
