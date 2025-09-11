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

  const handleMontoPropuestoChange = (programaId, identificador, nuevoMonto) => {
    setProgramas(prev => {
      const updated = prev.map(p => {
        if (p.id !== programaId) return p;
        return {
          ...p,
          oportunidades: (p.oportunidades ?? []).map(oportunidad => {
            if (oportunidad.dni === identificador) {
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
                monto_editado_por_daf: false
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
  // Mostrar en consola las oportunidades afectadas (alumnos editados)
    // Actualizar monto_propuesto en backend para cada oportunidad editada
    await Promise.all(alumnosEditados.map(async (alumno) => {
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
    }));
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
    const solicitudesAlumnos = alumnosEditados.map(alumno => {
      const programaDelAlumno = programas.find(p => p.id === alumno.programaId);
      return {
        id_propuesta: Number(propuestaId),
        id_propuesta_oportunidad: Number(alumno.id_propuesta_oportunidad),
        id_usuario_generador: currentUser.id_usuario,
        id_usuario_receptor: programaDelAlumno.id_jefe_producto,
        monto_propuesto: Number(alumno.monto_propuesto_daf),
        monto_objetado: Number(0),
        comentario: `DAF ajustó el monto propuesto de ${alumno.monto} a ${alumno.monto_propuesto_daf}`
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
    solicitudesAlumnos.forEach((solicitud) => {
      const promesa = enviarSolicitudAlBackend('/solicitudes/daf/oportunidad/monto/', solicitud);
      promesasEnvio.push(promesa);
    });
    solicitudesProgramas.forEach((solicitud) => {
      const promesa = enviarSolicitudAlBackend('/solicitudes/daf/programa/exclusion', solicitud);
      promesasEnvio.push(promesa);
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
      })
      .catch((error) => {
        console.error('Error en el proceso de preconciliación:', error);
        setIsLoading(false);
        alert('Se produjo un error durante el proceso de preconciliación. Consulta la consola para más detalles.');
        navigate('/main/propuestas', { replace: true });
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
