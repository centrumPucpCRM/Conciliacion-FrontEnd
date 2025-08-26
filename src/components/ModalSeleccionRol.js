import React, { useState } from 'react';
import { ROLES, USUARIOS_JP, USUARIOS_SUBDIRECTOR } from '../utils/mockData';
import { useRole } from '../context/RoleContext';

const ModalSeleccionRol = ({ isOpen, onClose, onRolSeleccionado, propuesta }) => {
  const {
    setCurrentUserJP,
    setCurrentUserSubdirector
  } = useRole();

  const [rolSeleccionado, setRolSeleccionado] = useState(ROLES.JP);
  const [jpSeleccionado, setJPSeleccionado] = useState(USUARIOS_JP[0].id);
  const [subSeleccionado, setSubSeleccionado] = useState(USUARIOS_SUBDIRECTOR[0].id);

  const handleRolChange = (e) => {
    setRolSeleccionado(e.target.value);
  };

  const handleJPChange = (e) => {
    setJPSeleccionado(e.target.value);
  };

  const handleSubChange = (e) => {
    setSubSeleccionado(e.target.value);
  };

  const handleContinuar = () => {
    if (rolSeleccionado === ROLES.JP) {
      const user = USUARIOS_JP.find(jp => jp.id === jpSeleccionado);
      setCurrentUserJP(user);
    }
    if (rolSeleccionado === ROLES.SUBDIRECTOR) {
      const user = USUARIOS_SUBDIRECTOR.find(sub => sub.id === subSeleccionado);
      setCurrentUserSubdirector(user);
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
            <option value={ROLES.ADMINISTRADOR}>Administrador</option>
            <option value={ROLES.DAF}>DAF</option>
            <option value={ROLES['DAF-SD']}>DAF-SD</option>
            <option value={ROLES.JP}>JP</option>
            <option value={ROLES.SUBDIRECTOR}>Subdirector</option>
          </select>
        </div>
        {rolSeleccionado === ROLES.JP && (
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">Seleccione el JP:</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
              value={jpSeleccionado}
              onChange={handleJPChange}
            >
              {USUARIOS_JP.map(jp => (
                <option key={jp.id} value={jp.id}>{jp.nombre}</option>
              ))}
            </select>
          </div>
        )}
        {rolSeleccionado === ROLES.SUBDIRECTOR && (
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 mb-2">Seleccione el Subdirector:</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-orange"
              value={subSeleccionado}
              onChange={handleSubChange}
            >
              {USUARIOS_SUBDIRECTOR.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.nombre}</option>
              ))}
            </select>
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
