// src/components/Propuestas/ModalNuevaPropuesta.jsx
import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { CARTERAS, determinarEstadoInicial } from '../../utils/mockData';

const SuccessPopup = ({ type, fechaTexto, onClose }) => {
  const isGenerada = type === 'generada';
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
            isGenerada ? 'bg-green-100' : 'bg-blue-100'
          }`}
        >
          {isGenerada ? (
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor">
              <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20z" strokeWidth="2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor">
              <path d="M12 8v4l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeWidth="2" />
            </svg>
          )}
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {isGenerada ? '¡Propuesta generada!' : '¡Propuesta programada!'}
        </h3>

        <p className="text-gray-700 mb-1">
          {isGenerada
            ? 'Tu propuesta fue generada correctamente.'
            : 'Tu propuesta fue programada correctamente.'}
        </p>
        {fechaTexto && (
          <p className="text-gray-500 text-sm mb-6">Fecha y hora: {fechaTexto}</p>
        )}

        <button
          type="button"
          className={`px-6 py-3 rounded-lg text-white font-medium ${
            isGenerada ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

const ModalNuevaPropuesta = ({ isOpen, onClose, onPropuestaCreada }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '12',
    carteras: []
  });

  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const [resultModal, setResultModal] = useState({
    open: false,
    type: '', // 'generada' | 'programada'
    fechaTexto: ''
  });

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const selectAllRef = useRef(null);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Indeterminate visual del "Seleccionar todos"
  const allSelected = CARTERAS.length > 0 && formData.carteras.length === CARTERAS.length;
  const someSelected = formData.carteras.length > 0 && !allSelected;
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Toggle de cartera (sirve también para quitar desde el chip)
  const handleCarteraChange = (cartera) => {
    setFormData((prev) => ({
      ...prev,
      carteras: prev.carteras.includes(cartera)
        ? prev.carteras.filter((c) => c !== cartera)
        : [...prev.carteras, cartera]
    }));
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const dropdownHeight = 200; // ~max panel
      setDropdownDirection(spaceBelow < dropdownHeight ? 'up' : 'down');
    }
    setIsDropdownOpen((v) => !v);
  };

  const toggleAllCarteras = () => {
    setFormData((prev) => ({
      ...prev,
      carteras: allSelected ? [] : [...CARTERAS],
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fecha) newErrors.fecha = 'La fecha es requerida';
    if (!formData.hora) newErrors.hora = 'La hora es requerida';
    if (formData.carteras.length === 0)
      newErrors.carteras = 'Debe seleccionar al menos una cartera';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCloseAll = () => {
    setResultModal({ open: false, type: '', fechaTexto: '' });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fechaCompleta = new Date(`${formData.fecha}T${formData.hora}:00:00`);
    const now = new Date();

    const estado = determinarEstadoInicial(fechaCompleta);

    const nuevaPropuesta = {
      id: uuidv4(),
      nombre: `Propuesta_${format(fechaCompleta, 'yyyy-MM-dd')}_${formData.hora}`,
      fecha_propuesta: fechaCompleta,
      estado,
      carteras: formData.carteras,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    };

    onPropuestaCreada(nuevaPropuesta);

    // Limpiar formulario
    setFormData({ fecha: '', hora: '12', carteras: [] });

    const isGenerada = fechaCompleta <= now;
    setResultModal({
      open: true,
      type: isGenerada ? 'generada' : 'programada',
      fechaTexto: format(fechaCompleta, 'dd/MM/yyyy HH:mm')
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft border border-gray-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Nueva Propuesta</h2>
          <button
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold cursor-pointer transition-colors duration-200"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* CARTERAS */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Carteras *
            </label>

            <div className="relative" ref={dropdownRef}>
              <button
                ref={buttonRef}
                type="button"
                onClick={toggleDropdown}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 bg-white text-left flex items-center justify-between"
              >
                <span className={formData.carteras.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.carteras.length > 0
                    ? `${formData.carteras.length} cartera${formData.carteras.length > 1 ? 's' : ''} seleccionada${formData.carteras.length > 1 ? 's' : ''}`
                    : 'Seleccione las carteras'}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div
                  className={`absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-52 overflow-y-auto ${
                    dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
                  }`}
                >
                  {/* Seleccionar todos */}
                  <div
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-200 flex items-center gap-3"
                    onClick={toggleAllCarteras}
                  >
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      readOnly
                      checked={allSelected}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Seleccionar todos</span>
                  </div>
                  <div className="border-t border-gray-200" />

                  {/* Opciones individuales */}
                  {CARTERAS.map((cartera) => (
                    <div key={cartera} className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                      <label className="flex items-center cursor-pointer w-full">
                        <input
                          type="checkbox"
                          checked={formData.carteras.includes(cartera)}
                          onChange={() => handleCarteraChange(cartera)}
                          className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{cartera}</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CHIPS DE CARTERAS */}
            {formData.carteras.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.carteras.map((cartera) => (
                  <span
                    key={cartera}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {cartera}
                    <button
                      type="button"
                      className="ml-1 text-green-600 hover:text-green-800 font-bold"
                      onClick={() => handleCarteraChange(cartera)}
                      aria-label={`Quitar ${cartera}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {errors.carteras && <span className="text-red-500 text-sm mt-2 block">{errors.carteras}</span>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-3">
                Fecha de Propuesta *
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                value={formData.fecha}
                onChange={handleInputChange}
              />
              {errors.fecha && <span className="text-red-500 text-sm mt-2 block">{errors.fecha}</span>}
            </div>

            <div>
              <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-3">
                Hora de Propuesta *
              </label>
              <select
                id="hora"
                name="hora"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                value={formData.hora}
                onChange={handleInputChange}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i.toString().padStart(2, '0')}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
              {errors.hora && <span className="text-red-500 text-sm mt-2 block">{errors.hora}</span>}
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              Crear Propuesta
            </button>
          </div>
        </form>
      </div>

      {resultModal.open && (
        <SuccessPopup
          type={resultModal.type}
          fechaTexto={resultModal.fechaTexto}
          onClose={handleCloseAll}
        />
      )}
    </div>
  );
};

export default ModalNuevaPropuesta;
