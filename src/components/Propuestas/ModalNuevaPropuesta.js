// src/components/Propuestas/ModalNuevaPropuesta.jsx

import React, { useState, useRef, useEffect } from 'react';

import { v4 as uuidv4 } from 'uuid';

import { format } from 'date-fns';

import { determinarEstadoInicial } from '../../utils/mockData';



const S3_BASE_URL = 'https://centrum-conciliacion-service.s3.us-east-1.amazonaws.com';

const HOURS_24 = Array.from({ length: 24 }, (_, i) => ({

  value: i.toString().padStart(2, '0'),

  label: `${i.toString().padStart(2, '0')}:00`

}));




const BACKEND_BASE_URL = 'http://localhost:8000';


const hourToS3Suffix = (hourValue) => {

  const hour = Number(hourValue);

  const period = hour >= 12 ? 'PM' : 'AM';

  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${hour12}${period}`;

};



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
        <h3 className="text-2xl font-bold text-slate-900 mb-2">

          {isGenerada ? 'Â¡Propuesta generada!' : 'Â¡Propuesta programada!'}

        </h3>



        <p className="text-slate-700 mb-1">

          {isGenerada

            ? 'Tu propuesta fue generada correctamente.'

            : 'Tu propuesta fue programada correctamente.'}

        </p>

        {fechaTexto && (

          <p className="text-slate-500 text-sm mb-6">Fecha y hora: {fechaTexto}</p>

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
  // Dropdown and carteras selection states/refs/handlers
  const buttonRef = useRef(null);
  const selectAllRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState('down');
  const [allSelected, setAllSelected] = useState(false);
  const [loadingCarteras, setLoadingCarteras] = useState(false);
  const [carterasDisponibles, setCarterasDisponibles] = useState([]);

  // Toggle dropdown open/close
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Toggle select all carteras
  const toggleAllCarteras = () => {
    if (allSelected) {
      setFormData((prev) => ({ ...prev, carteras: [] }));
    } else {
      setFormData((prev) => ({ ...prev, carteras: carterasDisponibles }));
    }
    setAllSelected((prev) => !prev);
  };

  // Handle individual cartera selection
  const handleCarteraChange = (cartera) => {
    setFormData((prev) => {
      const alreadySelected = prev.carteras.includes(cartera);
      const newCarteras = alreadySelected
        ? prev.carteras.filter((c) => c !== cartera)
        : [...prev.carteras, cartera];
      setAllSelected(newCarteras.length === carterasDisponibles.length);
      return { ...prev, carteras: newCarteras };
    });
  };

  // Fetch carterasDisponibles from backend using utility
  useEffect(() => {
    async function loadCarteras() {
      setLoadingCarteras(true);
      try {
        // Import fetchCarteras dynamically to avoid circular deps if needed
        const { fetchCarteras } = await import('../../utils/mockData');
        const carteras = await fetchCarteras();
        setCarterasDisponibles(carteras);
      } catch (err) {
        setCarterasDisponibles([]);
      }
      setLoadingCarteras(false);
    }
    loadCarteras();
  }, []);


  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    hora: '',
    carteras: []
  });
  const [availableHours, setAvailableHours] = useState([]);

  const [loadingHoras, setLoadingHoras] = useState(false);

  const hoursRequestRef = useRef(null);
  // Fix: Add missing dropdownRef definition
  const dropdownRef = useRef(null);




  useEffect(() => {

    return () => {

      if (hoursRequestRef.current) {

        hoursRequestRef.current.abort();

      }

    };

  }, []);



  const checkCsvAvailability = async (url, signal) => {

    try {

      const headResponse = await fetch(url, { method: 'HEAD', signal, cache: 'no-store' });

      if (headResponse.ok) return true;

      if (headResponse.status === 403 || headResponse.status === 405) {

        const getResponse = await fetch(url, { method: 'GET', signal, cache: 'no-store' });

        return getResponse.ok;

      }

    } catch (error) {

      if (error.name === 'AbortError') throw error;

      try {

        const getResponse = await fetch(url, { method: 'GET', signal, cache: 'no-store' });

        return getResponse.ok;

      } catch (fallbackError) {

        if (fallbackError.name === 'AbortError') throw fallbackError;

      }

    }

    return false;

  };



  const fetchHoursForDate = async (selectedDate) => {

    if (hoursRequestRef.current) {

      hoursRequestRef.current.abort();

    }



    if (!selectedDate) {

      setAvailableHours([]);

      setLoadingHoras(false);

      setFormData((prev) => ({ ...prev, hora: '' }));

      hoursRequestRef.current = null;

      return;

    }



    const controller = new AbortController();

    hoursRequestRef.current = controller;

    setLoadingHoras(true);

    setAvailableHours([]);



    try {

      const availabilityChecks = await Promise.all(

        HOURS_24.map(async ({ value }) => {

          const suffix = hourToS3Suffix(value);

          const url = `${S3_BASE_URL}/CONCILIACION_${selectedDate}+${suffix}.csv`;

          console.log('[fetchHoursForDate] Verificando', selectedDate, value, url);

          const exists = await checkCsvAvailability(url, controller.signal);

          return exists ? value : null;

        })

      );



      if (controller.signal.aborted) {

        return;

      }



      const horariosDisponibles = availabilityChecks.filter(Boolean);

      setAvailableHours(horariosDisponibles);

      setFormData((prev) => {

        if (horariosDisponibles.includes(prev.hora)) {

          return prev;

        }

        return { ...prev, hora: horariosDisponibles.length > 0 ? horariosDisponibles[0] : '' };

      });

    } catch (error) {

      if (error.name !== 'AbortError') {

        console.error('Error al obtener los horarios disponibles', error);

        setAvailableHours([]);

        setFormData((prev) => ({ ...prev, hora: '' }));

      }

    } finally {

      if (!controller.signal.aborted) {

        setLoadingHoras(false);

        hoursRequestRef.current = null;

      }

    }

  };



  const [errors, setErrors] = useState({});

  const [resultModal, setResultModal] = useState({

    open: false,

    type: '', // 'generada' | 'programada'

    fechaTexto: ''

  });









  const handleInputChange = (e) => {

    const { name, value } = e.target;



    if (name === 'fecha') {

      setFormData((prev) => ({ ...prev, fecha: value, hora: '' }));

      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

      fetchHoursForDate(value);

      return;

    }



    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

  };












  const validateForm = () => {

    const newErrors = {};

    if (!formData.fecha) {

      newErrors.fecha = 'La fecha es requerida';

    }

    if (!formData.hora) {

      newErrors.hora =

        formData.fecha && availableHours.length === 0

          ? 'No hay horarios disponibles para la fecha seleccionada'

          : 'La hora es requerida';

    }


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };



  const resetForm = () => {

    setFormData({ nombre: '', fecha: '', hora: '', carteras: [] });

    setAvailableHours([]);

    setLoadingHoras(false);

    if (hoursRequestRef.current) {

      hoursRequestRef.current.abort();

      hoursRequestRef.current = null;

    }

  };



  const handleCloseAll = () => {

    resetForm();

    setResultModal({ open: false, type: '', fechaTexto: '' });

    onClose();

  };



  const isHourSelectDisabled = !formData.fecha || loadingHoras || availableHours.length === 0;

  const shouldShowNoHoursMessage = formData.fecha && !loadingHoras && availableHours.length === 0;

  const hourOptions = availableHours.map((hour) => {

    const horaConfig = HOURS_24.find((item) => item.value === hour);

    return { value: hour, label: horaConfig ? horaConfig.label : `${hour}:00` };

  });




const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const fechaCompleta = new Date(`${formData.fecha}T${formData.hora}:00:00`);
  const csvSuffix = hourToS3Suffix(formData.hora);
  const csvFileName = `CONCILIACION_${formData.fecha}+${csvSuffix}.csv`;
  const csvUrl = `${S3_BASE_URL}/${csvFileName}`;
  const nombrePropuesta =
    formData.nombre.trim() || `Propuesta_${format(fechaCompleta, 'yyyy-MM-dd')}_${formData.hora}`;
  const fechaEnvio = `${formData.fecha}T${formData.hora}:00`;
  const now = new Date();

  const estado = determinarEstadoInicial(fechaCompleta);

  const nuevaPropuesta = {
    id: uuidv4(),
    nombre: nombrePropuesta,
    fecha_propuesta: fechaCompleta,
    estado,
    carteras: formData.carteras,
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  onPropuestaCreada(nuevaPropuesta);

  let csvResponse;
  try {
    csvResponse = await fetch(csvUrl, { cache: 'no-store' });
  } catch (requestError) {
    console.error('No se pudo obtener el CSV desde S3:', requestError);
  }

  if (!csvResponse || !csvResponse.ok) {
    const status = csvResponse ? csvResponse.status : 'sin respuesta';
    console.error(`Fallo al descargar CSV: ${status}`);
    window.open(csvUrl, '_blank', 'noopener');
    return;
  }

  try {
    const uploadResponse = await fetch(`${BACKEND_BASE_URL}/upload-conciliacion-csv/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propuesta: {
          nombre: nombrePropuesta,
          fecha: fechaEnvio,
          carteras: formData.carteras
        },
        csv_url: csvUrl
      })
    });
    if (!uploadResponse.ok) {
      console.error(`Error al enviar la conciliación al backend: ${uploadResponse.status}`);
    }
  } catch (uploadError) {
    console.error('Error al enviar la conciliaciÃ³n al backend:', uploadError);
  }

  try {
    const blob = await csvResponse.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const tempLink = document.createElement('a');
    tempLink.href = downloadUrl;
    tempLink.download = csvFileName;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (downloadError) {
    console.error('No se pudo descargar el CSV indicado:', downloadError);
    window.open(csvUrl, '_blank', 'noopener');
  }

  // Limpiar formulario
  resetForm();

  const isGenerada = fechaCompleta <= now;
  setResultModal({
    open: true,
    type: isGenerada ? 'generada' : 'programada',
    fechaTexto: format(fechaCompleta, 'dd/MM/yyyy HH:mm')
  });
};
;



















  if (!isOpen) return null;



  return (

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

      <div className="bg-white rounded-2xl shadow-soft border border-slate-200 w-full max-w-2xl max-h-[85vh] overflow-y-auto">

        <div className="flex justify-between items-center p-8 border-b border-slate-200">

          <h2 className="text-2xl font-bold text-gray-800">Nueva Propuesta</h2>

          <button

            className="text-slate-400 hover:text-slate-600 text-3xl font-bold cursor-pointer transition-colors duration-200"

            onClick={onClose}

            aria-label="Cerrar modal"

          >

            &times;

          </button>

        </div>



        <form onSubmit={handleSubmit} className="p-8">

          <div className="mb-8">

            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-3">

              Nombre de la Propuesta *

            </label>

            <input

              type="text"

              id="nombre"

              name="nombre"

              className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-colors duration-200"

              placeholder="Ingrese un nombre"

              value={formData.nombre}

              onChange={handleInputChange}

              autoComplete="off"

              required

            />

          </div>

          {/* CARTERAS */}

          <div className="mb-8">

            <label className="block text-sm font-medium text-slate-700 mb-3">

              Carteras *

            </label>



            <div className="relative" ref={dropdownRef}>

              <button

                ref={buttonRef}

                type="button"

                onClick={toggleDropdown}

                className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-colors duration-200 bg-white text-left flex items-center justify-between"

              >

                <span className={formData.carteras.length > 0 ? 'text-slate-900' : 'text-slate-500'}>

                  {formData.carteras.length > 0

                    ? `${formData.carteras.length} cartera${formData.carteras.length > 1 ? 's' : ''} seleccionada${formData.carteras.length > 1 ? 's' : ''}`

                    : 'Seleccione las carteras'}

                </span>

                <svg

                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}

                  fill="none"

                  stroke="currentColor"

                  viewBox="0 0 24 24"

                >

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />

                </svg>

              </button>



              {isDropdownOpen && (

                <div

                  className={`absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto ${

                    dropdownDirection === 'up' ? 'bottom-full mb-1' : 'top-full mt-1'

                  }`}

                >

                  {/* Seleccionar todos */}

                  <div

                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors duration-200 flex items-center gap-3"

                    onClick={toggleAllCarteras}

                  >

                    <input

                      ref={selectAllRef}

                      type="checkbox"

                      readOnly

                      checked={allSelected}

                      className="h-4 w-4 text-sky-500 focus:ring-sky-200 border-slate-200 rounded"

                    />

                    <span className="text-sm text-slate-700">Seleccionar todos</span>

                  </div>

                  <div className="border-t border-slate-200" />



                  {/* Opciones individuales */}

                  {loadingCarteras ? (

                    <div className="text-slate-500 text-sm px-4 py-2">Cargando carteras...</div>

                  ) : (

                    carterasDisponibles.map((cartera) => (

                      <div key={cartera} className="px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors duration-200">

                        <label className="flex items-center cursor-pointer w-full">

                          <input

                            type="checkbox"

                            checked={formData.carteras.includes(cartera)}

                            onChange={() => handleCarteraChange(cartera)}

                            className="mr-3 h-4 w-4 text-sky-500 focus:ring-sky-200 border-slate-200 rounded"

                          />

                          <span className="text-sm text-slate-700">{cartera}</span>

                        </label>

                      </div>

                    ))

                  )}

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

                    x

                    </button>

                  </span>

                ))}

              </div>

            )}



            {errors.carteras && <span className="text-red-500 text-sm mt-2 block">{errors.carteras}</span>}

          </div>



          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            <div>

              <label htmlFor="fecha" className="block text-sm font-medium text-slate-700 mb-3">

                Fecha de Propuesta *

              </label>

              <input

                type="date"

                id="fecha"

                name="fecha"

                className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-colors duration-200"

                value={formData.fecha}

                onChange={handleInputChange}

              />

              {errors.fecha && <span className="text-red-500 text-sm mt-2 block">{errors.fecha}</span>}

            </div>



            <div>

              <label htmlFor="hora" className="block text-sm font-medium text-slate-700 mb-3">

                Hora de Propuesta *

              </label>

              <select

                id="hora"

                name="hora"

                className="w-full px-4 py-3 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-colors duration-200"

                value={formData.hora}

                onChange={handleInputChange}

                disabled={isHourSelectDisabled}

              >

                {!formData.fecha && <option value="">Seleccione una fecha primero</option>}

                {formData.fecha && loadingHoras && <option value="">Buscando horarios disponibles...</option>}

                {shouldShowNoHoursMessage && <option value="">No hay horarios disponibles</option>}

                {hourOptions.map(({ value, label }) => (

                  <option key={value} value={value}>

                    {label}

                  </option>

                ))}

              </select>

              {shouldShowNoHoursMessage && (

                <span className="text-slate-500 text-sm mt-2 block">

                  No hay horarios disponibles para la fecha seleccionada.

                </span>

              )}

              {errors.hora && <span className="text-red-500 text-sm mt-2 block">{errors.hora}</span>}

            </div>

          </div>



          <div className="flex gap-4 justify-end pt-6 border-t border-slate-200">

            <button

              type="button"

              className="px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg transition-colors duration-200 font-medium"

              onClick={onClose}

            >

              Cancelar

            </button>

            <button

              type="submit"

              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors duration-200 font-medium"

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
































