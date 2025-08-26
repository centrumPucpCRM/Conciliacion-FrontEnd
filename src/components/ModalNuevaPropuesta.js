import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { CARTERAS, determinarEstadoInicial } from '../utils/mockData';

const ModalNuevaPropuesta = ({ isOpen, onClose, onPropuestaCreada }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    hora: '12',
    carteras: []
  });

  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCarteraChange = (cartera) => {
    setFormData(prev => ({
      ...prev,
      carteras: prev.carteras.includes(cartera)
        ? prev.carteras.filter(c => c !== cartera)
        : [...prev.carteras, cartera]
    }));
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen && buttonRef.current) {
      // Calcular si hay espacio suficiente hacia abajo
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const dropdownHeight = 160; // max-h-40 = 160px
      
      setDropdownDirection(spaceBelow < dropdownHeight ? 'up' : 'down');
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }

    if (!formData.hora) {
      newErrors.hora = 'La hora es requerida';
    }

    if (formData.carteras.length === 0) {
      newErrors.carteras = 'Debe seleccionar al menos una cartera';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Crear fecha combinada
    const fechaCompleta = new Date(`${formData.fecha}T${formData.hora}:00:00`);
    
    // Determinar estado inicial
    const estado = determinarEstadoInicial(fechaCompleta);
    
    // Crear nueva propuesta
    const nuevaPropuesta = {
      id: uuidv4(),
      nombre: `Propuesta_${format(fechaCompleta, 'yyyy-MM-dd')}_${formData.hora}`,
      fecha_propuesta: fechaCompleta,
      estado: estado,
      carteras: formData.carteras,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    };

    onPropuestaCreada(nuevaPropuesta);
    
    // Limpiar formulario
    setFormData({
      fecha: '',
      hora: '12',
      carteras: []
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft border border-gray-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Nueva Propuesta</h2>
          <button 
            className="text-gray-400 hover:text-gray-600 text-3xl font-bold cursor-pointer transition-colors duration-200"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8">
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
                    : 'Seleccione las carteras'
                  }
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
                <div className={`absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto ${
                  dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'
                }`}>
                  {CARTERAS.map(cartera => (
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
    </div>
  );
};

export default ModalNuevaPropuesta;
