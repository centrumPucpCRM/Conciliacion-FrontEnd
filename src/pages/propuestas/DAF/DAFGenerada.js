

// import { useConciliacion } from '../../../context/ConciliacionContext';
import { format as formatDate, subMonths } from 'date-fns';
import { es as localeEs } from 'date-fns/locale';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha, ESTADOS } from '../../../utils/mockData';
import { usePropuestas } from '../../../context/PropuestasContext';
import { useProgramas } from '../../../context/ProgramasContext';
import { useRole } from '../../../context/RoleContext';
import PropuestasHeader from '../../../components/Propuestas/PropuestasHeader';
import Tabs from '../../../components/DAF/Generada/Tabs';
import PropuestaResumen from '../../../components/DAF/Generada/PropuestaResumen';
import ProgramasGrillaDAF from '../../../components/DAF/Generada/ProgramasGrillaDAF';
import ProgramasGrillaDAFRevision from '../../../components/DAF/Generada/ProgramasGrillaDAFRevision';
import ConfirmPreConciliarModal from '../../../components/DAF/Generada/ConfirmPreConciliarModal';
import LoadingModal from '../../../components/common/LoadingModal';


const DAFGenerada = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();

  const { propuestas } = usePropuestas();
  const { programas, setProgramas } = useProgramas();
  const { currentUser, changeUser } = useRole();
  const [activeTab, setActiveTab] = useState('mesConciliado');
  const [expanded, setExpanded] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCarteras, setSelectedCarteras] = useState([]);
  
  // Buscar la propuesta real por id
  const propuesta = propuestas.find(p => String(p.id_propuesta) === String(propuestaId));
  const hasUpdatedUser = React.useRef(false);
    
  useEffect(() => {
    if (!currentUser || hasUpdatedUser.current) return;
    
    const urlParams = new URLSearchParams(window.location.search);    
    const userId = urlParams.get('id_usuario');
    
    // Si hay un ID de usuario en la URL y es diferente al actual, actualizamos el contexto
    if (userId && userId !== currentUser.id_usuario.toString()) {      
      // Crear una copia del usuario actual con el nuevo ID
      const updatedUser = {
        ...currentUser,
        id_usuario: userId
      };
      
      // Marcar que ya hemos actualizado el usuario para evitar bucles
      hasUpdatedUser.current = true;
      
      // Actualizar el contexto con el usuario modificado
      changeUser(updatedUser, currentUser.rol);
    } else {
      // Si no hay cambio que hacer, también marcamos como completado
      hasUpdatedUser.current = true;
    }
  }, []);
  
  // Llamada real al backend para obtener los programas de la propuesta
  useEffect(() => {
    if (!propuestaId) return;
    setIsLoading(true); // Comenzar a mostrar el estado de carga
    fetch(`http://127.0.0.1:8000/propuestas/${propuestaId}/programas`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const programasServicio = data.map(p => ({
            ...p,
            id: `programa-${p.nombre}`,
            cancelar: Boolean(p.cancelar)
          }));
          setProgramas(programasServicio);
        }
        setIsLoading(false); 
      })
      .catch(err => {
        console.error('Error al obtener programas de la propuesta:', err);
        setIsLoading(false);
      });
  }, [propuestaId]);



  // Separar programas en mes conciliado (más reciente) y 3 meses anteriores
  const [programasMesConciliado, programasResto] = React.useMemo(() => {
    if (!programas || programas.length === 0) return [[], []];
    // Obtener el mes más reciente (YYYY-MM)
    const meses = programas
      .map(p => p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null)
      .filter(Boolean);
    if (meses.length === 0) return [[], []];
    const mesMasReciente = meses.sort().reverse()[0];
    const mesConciliado = programas.filter(p => {
      const mes = p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null;
      return mes === mesMasReciente;
    });
    const resto = programas.filter(p => {
      const mes = p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null;
      return mes !== mesMasReciente;
    });
    return [mesConciliado, resto];
  }, [programas]);

  // Calcular el mes conciliado y los 3 meses anteriores en formato texto largo (local, no en contexto)
  const mesConciliacion = useMemo(() => {
    const fechaStr = propuesta?.fecha_propuesta || propuesta?.creado_en;
    if (fechaStr) {
      const fecha = new Date(fechaStr);
      if (!isNaN(fecha)) {
        const mesConciliadoDate = subMonths(fecha, 1);
        const mesConciliadoTexto = formatDate(mesConciliadoDate, "LLLL yyyy", { locale: localeEs });
        const mesesAnteriores = [2, 3, 4].map(n => {
          const d = subMonths(fecha, n);
          return formatDate(d, "LLLL yyyy", { locale: localeEs });
        });
        return {
          mesConciliado: mesConciliadoTexto.charAt(0).toUpperCase() + mesConciliadoTexto.slice(1),
          mesesAnteriores: mesesAnteriores.map(m => m.charAt(0).toUpperCase() + m.slice(1))
        };
      }
    }
    return null;
  }, [propuesta]);

  const programasNoAperturar = React.useMemo(() =>
    programas.filter(p => p.cancelar),
    [programas]
  );

  // Alumnos cuyo monto propuesto fue editado en sesión
  const alumnosEditados = React.useMemo(() =>
    programas
      .flatMap(p => (p.oportunidades).map(o => ({ ...o, programaId: p.id, nombrePrograma: p.nombre })))
      .filter(o => o.monto_editado_en_sesion === true || o.monto_editado_por_daf === true),
    [programas]
  );
  // Alumnos becados suprimidos en sesión
  const alumnosBecaSuprimidaEnSesion = React.useMemo(() =>
    programas
      .flatMap(p => (p.oportunidades || []).map(o => ({ ...o, programaId: p.id, nombrePrograma: p.nombre })))
      .filter(o => o.beca_suprimida_en_sesion === true),
    [programas]
  );
  useEffect(() => {
    if (alumnosBecaSuprimidaEnSesion.length > 0) {
      console.log('Alumnos con beca_suprimida_en_sesion:', alumnosBecaSuprimidaEnSesion);
    }
  }, [alumnosBecaSuprimidaEnSesion]);
  // Mostrar mensaje si no hay propuesta
  if (!propuesta) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center text-gray-700">
          Propuesta no encontrada.
        </div>
      </div>
    );
  }

  // Handler para manejar selección de No Aperturar (tipo checkbox normal, múltiples selecciones)
  const handleCancelarChange = (id) => {
    // Buscar el programa en el array completo de programas    
    const programa = programas.find(p => String(p.id) === String(id));
    
    if (!programa) {
      console.warn(`Programa con ID ${id} no encontrado para cambiar estado cancelar`);
      return;
    }
    // Simplemente invierte el estado actual del checkbox para ese programa específico
    const nuevoEstado = !programa.cancelar;
    setProgramas(prev => {
      const updated = prev.map(p => ({
        ...p,
        cancelar: String(p.id) === String(id) ? nuevoEstado : p.cancelar
      }));
      // Log programas actualizados para verificar el cambio
      return updated;
    });
  };

  const handleMontoPropuestoChange = (programaId, identificador, nuevoMonto, isBecaSuprimida = false) => {
    setProgramas(prev => {
      const updated = prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          oportunidades: (p.oportunidades ?? []).map(oportunidad => {
            if (oportunidad.dni === identificador) {
              if (isBecaSuprimida) {
                // Si es una supresión de beca, solo marcar flags de supresión, NO de edición de monto
                return {
                  ...oportunidad,
                  suprimido: true,
                  beca_suprimida_en_sesion: true,
                  monto_editado_en_sesion: false,
                  monto_editado_por_daf: false
                };
              }
              // Caso normal de edición de monto
              return {
                ...oportunidad,
                monto_inicial: oportunidad.monto,
                monto_propuesto: nuevoMonto,
                monto_propuesto_daf: nuevoMonto,
                monto_editado_en_sesion: true,
                monto_editado_por_daf: true,
                monto_editado_por_jp: false
              };
            }
            return oportunidad;
          })
        };
      });
      return updated;
    });
  };

  const handleRevertirMonto = (programaId, dni) => {
    setProgramas(prev => {
      const updated = prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          oportunidades: (p.oportunidades ?? []).map(oportunidad => {
            if (oportunidad.dni === dni) {
              return {
                ...oportunidad,
                monto_propuesto: oportunidad.monto,
                monto_propuesto_daf: oportunidad.monto,
                monto_editado_en_sesion: false,
                monto_editado_por_daf: false,
                suprimido: false, // Revertir la supresión
                beca_suprimida_en_sesion: false // Revertir la marca de beca suprimida
              };
            }
            return oportunidad;
          })
        };
      });
      return updated;
    });
  };

  const toggleExpand = (programaId) => {
    setExpanded(prev => ({ ...prev, [programaId]: !prev[programaId] }));
  };

  // Función para enviar solicitudes a la API
  const enviarSolicitudAlBackend = async (endpoint, data) => {
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      const resultado = await response.json();
      return { success: true, data: resultado };
    } catch (error) {
      console.error(`Error al enviar solicitud a ${endpoint}:`, error);
      return { success: false, error: error.message };
    }
  };

  const handleConfirmPreconciliar = async () => {
    // Actualizar monto_propuesto y etapa_venta_propuesto para alumnos editados y becados suprimidos
    const actualizaciones = [
      // Actualizar montos propuestos
      ...alumnosEditados.map(async (alumno) => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/propuesta_oportunidad/${alumno.id_propuesta_oportunidad}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ monto_propuesto: alumno.monto_propuesto_daf })
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error actualizando monto_propuesto para oportunidad ${alumno.id_propuesta_oportunidad}:`, errorText);
          }
        } catch (err) {
          console.error(`Error de red actualizando oportunidad ${alumno.id_propuesta_oportunidad}:`, err);
        }
      }),
      // Actualizar etapa_venta_propuesto para becados suprimidos
      ...alumnosBecaSuprimidaEnSesion.map(async (alumno) => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/propuesta_oportunidad/${alumno.id_propuesta_oportunidad}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              etapa_venta_propuesto: "Alumno Becado",
            })
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error actualizando etapa_venta_propuesto para becado ${alumno.id_propuesta_oportunidad}:`, errorText);
          }
        } catch (err) {
          console.error(`Error de red actualizando becado ${alumno.id_propuesta_oportunidad}:`, err);
        }
      })
    ];

    await Promise.all(actualizaciones);
    // Antes de enviar, actualizar monto_propuesto con monto_propuesto_daf en los alumnos editados
    setProgramas(prev => prev.map(p => ({
      ...p,
      oportunidades: (p.oportunidades ?? []).map(o =>
        o.monto_propuesto_daf !== undefined && o.monto_propuesto_daf !== null
          ? { ...o, monto_propuesto: o.monto_propuesto_daf }
          : o
      )
    })));

    // Preparamos los datos para enviar a la API

    // Solicitudes para alumnos editados (endpoint /monto)
    const solicitudesAlumnosEditados = alumnosEditados.map(alumno => {
      const programaDelAlumno = programas.find(p => p.id === alumno.programaId);
      return {
        id_propuesta: Number(propuestaId),
        id_propuesta_oportunidad: Number(alumno.id_propuesta_oportunidad),
        id_usuario_generador: currentUser.id_usuario,
        id_usuario_receptor: programaDelAlumno.id_jefe_producto,
        monto_propuesto: Number(alumno.monto_propuesto_daf),
        monto_objetado: null,
        comentario: `DAF ajustó el monto propuesto de ${alumno.monto} a ${alumno.monto_propuesto_daf}`
      };
    });

    // Solicitudes para becados suprimidos (endpoint /becado)
    const solicitudesAlumnosBecados = alumnosBecaSuprimidaEnSesion.map(alumno => {
      const programaDelAlumno = programas.find(p => p.id === alumno.programaId);
      return {
        id_propuesta: Number(propuestaId),
        id_propuesta_oportunidad: Number(alumno.id_propuesta_oportunidad),
        id_usuario_generador: currentUser.id_usuario,
        id_usuario_receptor: programaDelAlumno.id_jefe_producto,
        comentario: `DAF suprimió al alumno becado ${alumno.alumno || alumno.dni}`
      };
    });

    const solicitudesProgramas = programasNoAperturar.map(programa => {
      const matriculados = programa.oportunidades.filter(op =>
        op.etapa_venta_propuesto === "4 - Cerrada/Ganada" ||
        op.etapa_venta_propuesto === "3 - Matrícula"
      ).length;
      const minApertura = programa.punto_minimo_apertura;
      const id_propuesta_programa = programa.id_propuesta_programa ?
        Number(programa.id_propuesta_programa) :
        Number(programa.id);
      return {
        id_propuesta: Number(propuestaId),
        id_propuesta_programa: id_propuesta_programa,
        id_usuario_generador: currentUser.id_usuario,
        id_usuario_receptor: programa.id_jefe_producto,
        comentario: `DAF solicitó suprimir este programa ya que no cumple el mínimo de apertura (mínimo: ${minApertura}, matriculados actuales: ${matriculados})`
      };
    });
    setIsLoading(true);
    const promesasEnvio = [];
    // Enviar solicitudes de alumnos editados por /monto
    solicitudesAlumnosEditados.forEach((solicitud) => {
      const promesa = enviarSolicitudAlBackend('/solicitudes/daf/oportunidad/monto', solicitud);
      promesasEnvio.push(promesa);
    });
    // Enviar solicitudes de becados suprimidos por /becado
    solicitudesAlumnosBecados.forEach((solicitud) => {
      const promesa = enviarSolicitudAlBackend('/solicitudes/daf/oportunidad/becado', solicitud);
      promesasEnvio.push(promesa);
    });
    solicitudesProgramas.forEach((solicitud) => {
      const promesa = enviarSolicitudAlBackend('/solicitudes/daf/programa/exclusion', solicitud);
      promesasEnvio.push(promesa);
    });
    // Agrupar programas por subdireccion y enviar una sola solicitud por subdireccion
    const subdireccionReceptores = {
      'Grado': 46,
      'Educacion Ejecutiva': 47,
      'CentrumX': 48
    };
    // Crear un Set para trackear combinaciones únicas de subdirección-JP
    const combinacionesUnicas = new Set();
    
    // Crear una solicitud por cada combinación única de subdirección y JP
    programas.forEach(programa => {
      if (!programa.subdireccion || !programa.id_jefe_producto) return;
      
      // Crear una clave única para esta combinación
      const combinacionKey = `${programa.subdireccion}-${programa.id_jefe_producto}`;
      
      // Si ya procesamos esta combinación, la saltamos
      if (combinacionesUnicas.has(combinacionKey)) return;
      
      const id_usuario_receptor = subdireccionReceptores[programa.subdireccion];
      if (!id_usuario_receptor) return; // Si no hay receptor definido, omitir
      
      // Marcar esta combinación como procesada
      combinacionesUnicas.add(combinacionKey);
      
      // Obtener el nombre del JP
      console.log('Programa para solicitud JP:', programa);
      const jpNombre = programa.nombre_jefe_producto || `JP ID ${programa.id_jefe_producto}`;
      
      // Contar cuántos programas hay para esta combinación de JP y subdirección
      const programasDeEsteJP = programas.filter(p => 
        p.subdireccion === programa.subdireccion && 
        p.id_jefe_producto === programa.id_jefe_producto
      );
      
      const comentario = `${programa.subdireccion} - JP: ${jpNombre} - Programas: ${programasDeEsteJP.length}`;
      
      const solicitud = {
        id_propuesta: Number(propuestaId),
        id_usuario_generador: programa.id_jefe_producto,
        id_usuario_receptor,
        tipo_solicitud: 'APROBACION_JP',
        comentario,
        valor_solicitud: 'PENDIENTE'
      };
      
      console.log(solicitud);
      promesasEnvio.push(enviarSolicitudAlBackend('/solicitudes/jp/aprobacion_subdirector', solicitud));
    });
    Promise.all(promesasEnvio)
      .then((resultados) => {
        const errores = resultados.filter(r => !r.success);
        if (errores.length > 0) {
          console.error('Algunos envíos fallaron:', errores);
          alert(`Se encontraron ${errores.length} errores al enviar las solicitudes. Consulta la consola para más detalles.`);
        }
        return fetch(`http://localhost:8000/propuesta/${propuestaId}/preconciliado`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      })
      .then(response => {
        if (!response || !response.ok) {
          console.error('Error al cambiar el estado de la propuesta a preconciliado');
        }
        setIsLoading(false);
        navigate('/main/propuestas', { replace: true });
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error en el proceso de preconciliación:', error);
        setIsLoading(false);
        alert('Se produjo un error durante el proceso de preconciliación. Consulta la consola para más detalles.');
        navigate('/main/propuestas', { replace: true });
        window.location.reload();
      });
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <PropuestasHeader onBack={() => navigate('/main/propuestas')} titulo={"Etapa : Generación"} />

      <PropuestaResumen
        propuesta={propuesta}
        formatearFecha={formatearFecha}
        handlePreConciliar={() => setShowConfirm(true)}
      />


      <Tabs activeTab={activeTab} onTabChange={setActiveTab} propuesta={propuesta} mesConciliacion={mesConciliacion} />
      
      {/* Mostrar el modal de carga mientras isLoading es true */}
      {isLoading ? (
        <LoadingModal />
      ) : (
        <>
          {/* Estado de filtro de carteras para cada tab */}
          {activeTab === 'mesConciliado' && (
            <ProgramasGrillaDAF
              programas={programasMesConciliado}
              expanded={expanded}
              onToggleExpand={toggleExpand}
              onToggleCancelar={handleCancelarChange}
              onChangeMonto={handleMontoPropuestoChange}
              onRevertMonto={handleRevertirMonto}
              selectedCarteras={selectedCarteras}
              setSelectedCarteras={setSelectedCarteras}
            />
          )}

          {activeTab === 'mesesPasados' && (
            <ProgramasGrillaDAFRevision
              programas={programasResto}
              expanded={expanded}
              onToggleExpand={toggleExpand}
              onToggleCancelar={handleCancelarChange}
              onChangeMonto={handleMontoPropuestoChange}
              onRevertMonto={handleRevertirMonto}
              selectedCarteras={selectedCarteras}
              setSelectedCarteras={setSelectedCarteras}
            />
          )}
        </>
      )}      {/* Modal de confirmación */}
      <ConfirmPreConciliarModal
        open={showConfirm}
        programasNoAperturar={programasNoAperturar}
        alumnosEditados={alumnosEditados}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => handleConfirmPreconciliar()}
      />

    </div>
  );
};

export default DAFGenerada;
