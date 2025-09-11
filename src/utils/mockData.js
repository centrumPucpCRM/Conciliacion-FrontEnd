import { v4 as uuidv4 } from 'uuid';
import { format, addDays, subDays } from 'date-fns';

// Estados de propuesta
export const ESTADOS = {
  PROGRAMADA: 'PROGRAMADA',
  GENERADA: 'GENERADA',
  PRECONCILIADA: 'PRECONCILIADA',
  AUTORIZACION: 'AUTORIZACION',
  CONCILIADA: 'CONCILIADA',
  CANCELADO: 'CANCELADO'
};

// Roles del sistema
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  COMERCIAL_JEFE_PRODUCTO: 'Comercial - Jefe de producto',
  COMERCIAL_SUBDIRECTOR: 'Comercial - Subdirector',
  DAF_SUBDIRECTOR: 'DAF - Subdirector',
  DAF_SUPERVISOR: 'DAF - Supervisor'
};

// Carteras disponibles
// Carteras ahora se obtienen dinámicamente desde el backend
export async function fetchCarteras() {
  const res = await fetch('http://127.0.0.1:8000/cartera/?skip=0&limit=100');
  if (!res.ok) throw new Error('No se pudo obtener las carteras');
  // Ajusta según la estructura de respuesta de tu backend
  const data = await res.json();
  // Si el backend devuelve un array directo:
  if (Array.isArray(data)) return data.map(c => c.nombre || c);
  // Si el backend devuelve un objeto con un array:
  if (Array.isArray(data.carteras)) return data.carteras.map(c => c.nombre || c);
  return [];
}
// Utilidades para generar datos de matriculados
const MONEDAS = ['PEN', 'USD', 'EUR'];

function randomFechaPasada() {
  return format(subDays(new Date(), Math.floor(Math.random() * 365)), 'dd/MM/yyyy');
}
function randomId() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function generarIdentificador() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

function generarNombreAlumno() {
  const nombres = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez', 
                   'Carmen Sánchez', 'Jorge Torres', 'Isabel Flores', 'Roberto Morales', 'Patricia Ruiz'];
  const dni = Math.floor(10000000 + Math.random() * 90000000).toString();
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  return `${nombre} - ${dni}`;
}
export function generarPersonasPorPrograma({
  cantidadMatriculados = 3,
  cantidadInteres = 2,
  cantidadProximaConvocatoria = 2
} = {}) {
  const personas = [];
  for (let i = 0; i < cantidadMatriculados; i++) {
    const montoInicial = (Math.random() * 10000 + 500).toFixed(2);
    personas.push({
      identificador: randomId(),
      estado: 'matriculado',
      fecha_estado: randomFechaPasada(),
      monto: montoInicial,
      monto_propuesto: montoInicial, // Copiar el monto inicial
      moneda: MONEDAS[Math.floor(Math.random() * MONEDAS.length)]
    });
  }
  for (let i = 0; i < cantidadInteres; i++) {
    personas.push({
      identificador: randomId(),
      estado: 'interes',
      fecha_estado: randomFechaPasada()
    });
  }
  for (let i = 0; i < cantidadProximaConvocatoria; i++) {
    personas.push({
      identificador: randomId(),
      estado: 'proxima-convocatoria',
      fecha_estado: randomFechaPasada()
    });
  }
  return personas;
  }
  function randomFechaInaguracion() {
    const year = 2025;

    // 🔹 Mes entre 4 y 10 (abril–octubre)
    const month = Math.floor(Math.random() * (10 - 4 + 1)) + 4; // 4–10
    const monthIndex = month - 1; // Date usa 0–11

    // 🔹 Día válido entre 1 y 28 (para evitar problemas con meses cortos)
    const day = Math.floor(Math.random() * 28) + 1;

    return new Date(year, monthIndex, day);
  }

export async function generarProgramasPorCartera() {
  const carteras = await fetchCarteras();
  let programas = [];
  carteras.forEach(cartera => {
    for (let i = 1; i <= 10; i++) {
      // ...existing code...
      // (el resto del cuerpo de la función permanece igual)
      // ...existing code...
    }
  });
  return programas;
}

// Datos de prueba para propuestas
export async function generarPropuestasPrueba() {
  const carteras = await fetchCarteras();
  const propuestas = [];
  const estados = Object.values(ESTADOS);

  for (let i = 1; i <= 8; i++) {
    const fechaBase = new Date();
    fechaBase.setHours(0, 0, 0, 0);

    const fechaPropuestaDate = i % 3 === 0 ? addDays(fechaBase, i) : subDays(fechaBase, i);

    const estado = estados[i % estados.length];
    const numCarteras = (i % carteras.length) + 1;
    const carterasPropuesta = carteras.slice(0, numCarteras);

    const nombre = `Propuesta_${i}_${fechaPropuestaDate.toLocaleDateString('es-ES')}`;

    // 🔹 Nueva lógica: fecha y mes de inaguración directamente en la propuesta
    const mes_propuesta = format(fechaPropuestaDate, 'yyyy-MM'); // p.ej. "2025-09"

    const propuestaObj = {
      id: uuidv4(),
      nombre,
      fecha_propuesta: fechaPropuestaDate,
      estado,
      carteras: carterasPropuesta,
      mes_propuesta,
    };

    if (estado === ESTADOS.CANCELADO) {
      propuestaObj.motivo_cancelacion = `Motivo de cancelación ejemplo para propuesta ${i}`;
    }

    propuestas.push(propuestaObj);
  }

  return propuestas;
}


// Datos de prueba para conciliaciones
export const generarConciliacionesPrueba = () => {
  const conciliaciones = [];
  
  for (let i = 1; i <= 15; i++) {
    const fechaBase = new Date();
    const fechaConciliacion = subDays(fechaBase, i);
    
    conciliaciones.push({
      id: uuidv4(),
      nombre: `Conciliación_${format(fechaConciliacion, 'yyyy-MM-dd')}_${i}`,
      fecha_conciliacion: fechaConciliacion,
      estado: 'activa',
      propuestas_asociadas: Math.floor(Math.random() * 5) + 1,
      fecha_creacion: subDays(fechaBase, i + 10),
      fecha_actualizacion: new Date()
    });
  }
  
  return conciliaciones;
};

// Matriz de permisos por rol y estado
// MATRIZ_PERMISOS ahora se obtiene dinámicamente desde el backend
export async function fetchMatrizPermisos() {
  // Cambia la URL si tu backend está en otra ruta o puerto
  const res = await fetch('http://127.0.0.1:8000/matriz-permisos');
  if (!res.ok) throw new Error('No se pudo obtener la matriz de permisos');
  return await res.json();
}

// Función para verificar permisos (ahora requiere la matriz como argumento)
export const tienePermiso = (matrizPermisos, rol, estado) => {
  return matrizPermisos?.[rol]?.[estado] || false;
};

export const puedeCancelar = (matrizPermisos, rol) => {
  return matrizPermisos?.[rol]?.puedeCancelar || false;
};

// Función para determinar el estado inicial basado en la fecha
export const determinarEstadoInicial = (fechaPropuesta) => {
  const ahora = new Date();
  return fechaPropuesta > ahora ? ESTADOS.PROGRAMADA : ESTADOS.GENERADA;
};

// Función para formatear fecha
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  try {
    // Para debugging
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      return '';
    }
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
};

// Función para obtener el color del estado
export const obtenerColorEstado = (estado) => {
  const colores = {
    [ESTADOS.PROGRAMADA]: 'status-programada',
    [ESTADOS.GENERADA]: 'status-generada',
    [ESTADOS.PRECONCILIADA]: 'status-pre-conciliado',
    [ESTADOS.AUTORIZACION]: 'status-autorizacion',
    [ESTADOS.CONCILIADO]: 'status-conciliado',
    [ESTADOS.CANCELADO]: 'status-cancelado'
  };
  return colores[estado] || 'status-generada';
};

export const USUARIOS_JP = [
  {
    id: 'jp1',
    nombre: 'Liliana',
    carteras: ['Maestrias Especializadas', 'Lima Grado']
  },
  {
    id: 'jp2',
    nombre: 'Adriana',
    carteras: ['Lima Grado', 'Executive']
  },
  {
    id: 'jp3',
    nombre: 'Elizabeth',
    carteras: ['Innovacion', 'Edex'] // Cartera Comercial compartida con JP1
  }
];

export const USUARIOS_SUBDIRECTOR = [
  {
    id: 'sub1',
    nombre: 'Adriana',
    carteras: ['Maestrias Especializadas', 'Lima Grado',"Executive"]
  },
  {
    id: 'sub2',
    nombre: 'Manuel',
    carteras: ['Innovacion', 'Edex']
  },
  {
    id: 'sub3',
    nombre: 'Director CentrumX',
    carteras: ['Maestrias Especializadas'] // Cartera Personal compartida con sub2
  }
];