import { v4 as uuidv4 } from 'uuid';
import { format, addDays, subDays } from 'date-fns';

// Estados de propuesta
export const ESTADOS = {
  PROGRAMADA: 'programada',
  GENERADA: 'generada',
  PRE_CONCILIADO: 'pre-conciliado',
  AUTORIZACION: 'autorizacion',
  CONCILIADO: 'conciliado',
  CANCELADO: 'cancelado'
};

// Roles del sistema
export const ROLES = {
  ADMINISTRADOR: 'administrador',
  DAF: 'daf',
  DAF_SD: 'daf-sd', // Cambia la clave para que sea válida como propiedad JS
  JP: 'jp',
  SUBDIRECTOR: 'subdirector'
};

// Carteras disponibles
export const CARTERAS = [
  'Maestrias Especializadas',
  'Executive',
  'Innovacion',
  'Edex',
  'Lima Grado'
];

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

export const generarProgramasPorCartera = (carteras) => {
  let programas = [];
  carteras.forEach(cartera => {
    for (let i = 1; i <= 5; i++) {
      // Generar entre 0 y 5 matriculados, 1-3 interes, 1-2 proxima convocatoria
      const cantidadMatriculados = Math.floor(Math.random() * 6);
      const cantidadInteres = 1 + Math.floor(Math.random() * 3);
      const cantidadProximaConvocatoria = 1 + Math.floor(Math.random() * 2);
      
      const metaVenta = Math.floor(Math.random() * 50000) + 10000; // 10k-60k
      const metaAlumnos = Math.floor(Math.random() * 2) + 5; // 10-30 alumnos
      const montoReal = cantidadMatriculados * (Math.random() * 5000 + 3000); // 3k-8k por alumno
      
      const personas = [];
      
      // Generar personas matriculadas
      for (let j = 0; j < cantidadMatriculados; j++) {
        const montoInicial = (Math.random() * 10000 + 500).toFixed(2);
        personas.push({
          id: `${cartera}-${i}-${j}`,
          identificador: generarIdentificador(),
          alumno: generarNombreAlumno(),
          estado: 'matriculado',
          fecha_estado: randomFechaPasada(),
          monto: montoInicial,
          monto_propuesto: montoInicial, // Copiar el monto inicial
          monto_propuesto_daf: montoInicial, // También inicializar el monto propuesto por DAF
          moneda: MONEDAS[Math.floor(Math.random() * MONEDAS.length)],
          agregadoEnSesion: false,
          monto_editado_en_sesion: false,
          monto_editado_por_jp: false,
          monto_editado_por_daf: false
        });
      }
      
      // Generar personas interesadas
      for (let j = 0; j < cantidadInteres; j++) {
        personas.push({
          id: `${cartera}-${i}-int-${j}`,
          identificador: generarIdentificador(),
          alumno: generarNombreAlumno(),
          estado: 'interes',
          fecha_estado: randomFechaPasada(),
          monto: '',
          monto_propuesto: '', // Inicialmente vacío para personas no matriculadas
          moneda: '',
          agregadoEnSesion: false,
          monto_editado_en_sesion: false,
          monto_editado_por_jp: false,
          monto_editado_por_daf: false
        });
      }
      
      // Generar personas proxima convocatoria
      for (let j = 0; j < cantidadProximaConvocatoria; j++) {
        personas.push({
          id: `${cartera}-${i}-prox-${j}`,
          identificador: generarIdentificador(),
          alumno: generarNombreAlumno(),
          estado: 'proxima-convocatoria',
          fecha_estado: randomFechaPasada(),
          monto: '',
          monto_propuesto: '', // Inicialmente vacío para personas no matriculadas
          moneda: '',
          agregadoEnSesion: false,
          monto_editado_en_sesion: false,
          monto_editado_por_jp: false,
          monto_editado_por_daf: false
        });
      }
      
    programas.push({
         id: `${cartera}-${i}`,
         cartera,
         nombre: `Programa con nombre largo del programa es el programa de correlativo y de la cartera correspondiente ${i} (${cartera})`,
         meta_venta: metaVenta,
         meta_alumnos: metaAlumnos,
         alumnos_reales: cantidadMatriculados,
         monto_real: montoReal,
         minimo_apertura: 3,
         cancelar: false,
         personas: personas
       });
    }
  });
  return programas;
};

// Datos de prueba para propuestas
export const generarPropuestasPrueba = () => {
  const propuestas = [];
  const estados = Object.values(ESTADOS);

  for (let i = 1; i <= 8; i++) {
    const fechaBase = new Date();
    fechaBase.setHours(0, 0, 0, 0);

    const fechaPropuestaDate = i % 3 === 0 ? addDays(fechaBase, i) : subDays(fechaBase, i);

    let estado = estados[i % estados.length];
    const numCarteras = (i % CARTERAS.length) + 1;
    const carterasPropuesta = CARTERAS.slice(0, numCarteras);

    const nombre = `Propuesta_${i}_${fechaPropuestaDate.toLocaleDateString('es-ES')}`;

    // Si está cancelado, agrega motivo_cancelacion
    const propuestaObj = {
      id: uuidv4(),
      nombre,
      fecha_propuesta: fechaPropuestaDate,
      estado: estado,
      carteras: carterasPropuesta
    };
    if (estado === ESTADOS.CANCELADO) {
      propuestaObj.motivo_cancelacion = `Motivo de cancelación ejemplo para propuesta ${i}`;
    }

    propuestas.push(propuestaObj);
  }

  return propuestas;
};

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
export const MATRIZ_PERMISOS = {
  [ROLES.DAF_SD]: {
    [ESTADOS.PROGRAMADA]: false,
    [ESTADOS.GENERADA]: true,
    [ESTADOS.PRE_CONCILIADO]: true,
    [ESTADOS.AUTORIZACION]: true,
    [ESTADOS.CONCILIADO]: true,
    [ESTADOS.CANCELADO]: false,
    puedeCancelar: false
  },
  [ROLES.DAF]: {
    [ESTADOS.PROGRAMADA]: false,
    [ESTADOS.GENERADA]: true,
    [ESTADOS.PRE_CONCILIADO]: true,
    [ESTADOS.AUTORIZACION]: false,
    [ESTADOS.CONCILIADO]: true,
    [ESTADOS.CANCELADO]: false,
    puedeCancelar: false
  },
  [ROLES.JP]: {
    [ESTADOS.PROGRAMADA]: false,
    [ESTADOS.GENERADA]: false,
    [ESTADOS.PRE_CONCILIADO]: true,
    [ESTADOS.AUTORIZACION]: false,
    [ESTADOS.CONCILIADO]: true,
    [ESTADOS.CANCELADO]: false,
    puedeCancelar: false
  },
  [ROLES.SUBDIRECTOR]: {
    [ESTADOS.PROGRAMADA]: false,
    [ESTADOS.GENERADA]: false,
    [ESTADOS.PRE_CONCILIADO]: true,
    [ESTADOS.AUTORIZACION]: true,
    [ESTADOS.CONCILIADO]: true,
    [ESTADOS.CANCELADO]: false,
    puedeCancelar: false
  },
  [ROLES.ADMINISTRADOR]: {
    [ESTADOS.PROGRAMADA]: false,
    [ESTADOS.GENERADA]: true,
    [ESTADOS.PRE_CONCILIADO]: true,
    [ESTADOS.AUTORIZACION]: true,
    [ESTADOS.CONCILIADO]: true,
    [ESTADOS.CANCELADO]: true,
    puedeCancelar: true
  }
};

// Función para verificar permisos
export const tienePermiso = (rol, estado) => {
  return MATRIZ_PERMISOS[rol]?.[estado] || false;
};

export const puedeCancelar = (rol) => {
  return MATRIZ_PERMISOS[rol]?.puedeCancelar || false;
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
    console.log('Formateando fecha:', fecha, typeof fecha);
    const date = new Date(fecha);
    if (isNaN(date.getTime())) {
      console.log('Fecha inválida');
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
    [ESTADOS.PRE_CONCILIADO]: 'status-pre-conciliado',
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