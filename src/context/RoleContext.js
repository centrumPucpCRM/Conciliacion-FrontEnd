import React, { createContext, useContext, useState, useEffect } from 'react';


const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole debe ser usado dentro de un RoleProvider');
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const [rolesUsuarios, setRolesUsuarios] = useState([]);
  
  // Un único estado para el usuario actual que incluye rol, carteras y toda la información
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });
  
  // Mantenemos este estado por compatibilidad con el código existente
  // pero se podría eliminar en una refactorización completa
  const [currentRole, setCurrentRole] = useState(() => localStorage.getItem('currentRole') || '');

  // Cargar roles y usuarios desde el backend
  useEffect(() => {
    fetch('http://localhost:8000/roles-usuarios-carteras/')
      .then(res => res.json())
      .then(data => {
        setRolesUsuarios(data);
        
        // Si no hay un usuario actual guardado, seleccionar uno por defecto
        if (!localStorage.getItem('currentUser') && data.length > 0) {
          // Buscar el primer rol que tenga usuarios
          const primerRolConUsuarios = data.find(r => r.usuarios && r.usuarios.length > 0);
          if (primerRolConUsuarios) {
            // Crear el objeto currentUser con toda la información necesaria
            const primerUsuario = primerRolConUsuarios.usuarios[0];
            const nuevoCurrentUser = {
              ...primerUsuario,
              rol: primerRolConUsuarios.nombre,
              carteras: primerUsuario.carteras || []
            };
            setCurrentUser(nuevoCurrentUser);
            
            // Mantener compatibilidad con el código existente
            setCurrentRole(primerRolConUsuarios.nombre);
          }
        }
        
        // Mantener compatibilidad con el código existente
        // Selección automática del primer rol real si no hay uno guardado
        if (data.length > 0 && !localStorage.getItem('currentRole')) setCurrentRole(data[0].nombre);
        
      })
      .catch(() => setRolesUsuarios([]));
  }, []);

  // Guardar en localStorage cuando cambia currentUser
  useEffect(() => {
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);
  
  // Mantener compatibilidad con el código existente
  useEffect(() => {
    if (currentRole) localStorage.setItem('currentRole', currentRole);
  }, [currentRole]);

  // Nueva función para cambiar el usuario actual y su rol
  const changeUser = (usuario, rol) => {
    // Combinar la información del usuario y el rol
    const nuevoCurrentUser = {
      ...usuario,
      rol: rol
    };
    setCurrentUser(nuevoCurrentUser);
    setCurrentRole(rol); // Mantener compatibilidad
  };
  
  // Mantener compatibilidad con el código existente
  const changeRole = (newRole) => {
    setCurrentRole(newRole);
    
    // Intentar encontrar un usuario para este rol y actualizarlo también
    const rolInfo = rolesUsuarios.find(r => r.nombre === newRole);
    if (rolInfo && rolInfo.usuarios && rolInfo.usuarios.length > 0) {
      const usuarioDelRol = rolInfo.usuarios[0];
      changeUser(usuarioDelRol, newRole);
    }
  };

  const value = {
    // Nuevas propiedades unificadas
    currentUser,
    changeUser,
    
    // Mantener compatibilidad con el código existente
    currentRole,
    changeRole,
    rolesUsuarios
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
