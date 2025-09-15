import React, { useState, useMemo, useEffect } from 'react';
import { format as formatDate, subMonths } from 'date-fns';
import { es as localeEs } from 'date-fns/locale';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha } from '../../../utils/mockData';
import { usePropuestas } from '../../../context/PropuestasContext';
import { useProgramas } from '../../../context/ProgramasContext';
import { useRole } from '../../../context/RoleContext';
import PropuestasHeader from '../../../components/Propuestas/PropuestasHeader';
import PropuestaResumen from '../../../components/DAF/PreConciliada/PropuestaResumen';
import Tabs from '../../../components/JP/Tabs';
import SolicitudesAprobacion from '../../../components/JP/SolicitudesAprobacion';
import LoadingModal from '../../../components/common/LoadingModal';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ProgramasGrillaDAFRevision from '../../../components/DAF/PreConciliada/ProgramasGrillaDAFRevision';
import ProgramasGrillaDAF from '../../../components/DAF/PreConciliada/ProgramasGrillaDAF';

const DAFPreConciliado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();
  const { propuestas } = usePropuestas();
  const { programas, refutarPorJP, setRefutarPorJP, setProgramas } = useProgramas();
  const { currentUser, changeUser } = useRole();
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('solicitudes');
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedCarteras, setSelectedCarteras] = useState([]);

  // Buscar la propuesta real por id - intentando con ambos formatos de ID
  const propuesta = propuestas.find(p => 
    String(p.id_propuesta) === String(propuestaId) || 
    String(p.id) === String(propuestaId)
  ) || {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'pre-conciliado',
    carteras: [],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  // Efecto para actualizar el ID de usuario desde los parámetros de URL
  // Usamos una ref para asegurarnos de que solo se ejecute una vez
  const hasUpdatedUser = React.useRef(false);

  // Llamada real al backend para obtener los programas de la propuesta
  useEffect(() => {
    if (!propuestaId) {
      return;
    }
    setIsLoading(true); // Comenzar a mostrar el estado de carga
    const url = `http://127.0.0.1:8000/propuestas/${propuestaId}/programas`;
    
    fetch(url)
      .then(res => {
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          const programasServicio = data.map(p => ({
            ...p,
            id: `programa-${p.nombre}`,
            cancelar: Boolean(p.cancelar)
          }));
          setProgramas(programasServicio);
        } else {
          console.warn('Los datos recibidos no son un array:', data);
        }
        setIsLoading(false); 
      })
      .catch(err => {
        console.error('Error al obtener programas de la propuesta:', err);
        setIsLoading(false);
      });
  }, [propuestaId]);

  // Filtrar para mostrar solo programas donde el id_jefe_finanzas coincide con el id_usuario del DAF actual
  const programasFiltrados = useMemo(() => {
    return programas;
  }, [programas, propuesta.carteras]);
  
  // Separar programas en mes conciliado (más reciente) y 3 meses anteriores
  const [programasMesConciliado, programasResto] = useMemo(() => {
    if (!programasFiltrados || programasFiltrados.length === 0) return [[], []];
    // Obtener el mes más reciente (YYYY-MM)
    const meses = programasFiltrados
      .map(p => p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null)
      .filter(Boolean);
    if (meses.length === 0) return [[], []];
    const mesMasReciente = meses.sort().reverse()[0];
    const mesConciliado = programasFiltrados.filter(p => {
      const mes = p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null;
      return mes === mesMasReciente;
    });
    const resto = programasFiltrados.filter(p => {
      const mes = p.fecha_de_inauguracion ? new Date(p.fecha_de_inauguracion).toISOString().slice(0,7) : null;
      return mes !== mesMasReciente;
    });
    return [mesConciliado, resto];
  }, [programasFiltrados]);

  // Efecto para cargar solicitudes específicas del usuario actual
  useEffect(() => {
    if (!currentUser || !propuestaId) {
      return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);    
    const userId = urlParams.get('id_usuario') || currentUser?.id_usuario;
    console.log("user id", userId)
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
    // Ya no necesitamos cargar solicitudes aquí, ya que el componente SolicitudesAprobacion lo hace internamente
  }, [propuestaId]);
  
  // Handler para manejar selección de No Aperturar
  const handleCancelarChange = (id) => {
    const programa = programasFiltrados.find(p => String(p.id) === String(id));
    
    if (!programa) {
      console.warn(`Programa con ID ${id} no encontrado para cambiar estado cancelar`);
      return;
    }
    
    const nuevoEstado = !programa.cancelar;
    setProgramas(prev => {
      const updated = prev.map(p => ({
        ...p,
        cancelar: String(p.id) === String(id) ? nuevoEstado : p.cancelar
      }));
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
                monto_editado_por_jp: false,
                monto_editado_por_daf: true
              };
            }
            return oportunidad;
          })
        };
      });
      return updated;
    });
  };
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
  
  // Función para manejar la confirmación de todos los cambios
  const handleConfirmarTodosCambios = () => {
    setShowConfirm(false);
    setIsLoading(true);
    
    // Obtener el ID de usuario directamente de la URL o del contexto
    const urlParams = new URLSearchParams(window.location.search);    
    const userId = urlParams.get('id_usuario') || currentUser?.id_usuario;
    
    // Preparar datos para enviar
    const datosAprobacion = {
      id_propuesta: Number(propuestaId),
      id_usuario: userId,
      estado: 'conciliado'
    };
    
    // Enviar la actualización de estado al backend
    fetch(`http://127.0.0.1:8000/propuestas/${propuestaId}/estado`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datosAprobacion),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      setIsLoading(false);
      // Redirigir a la vista de propuestas
      navigate('/main/propuestas', { replace: true });
    })
    .catch(error => {
      console.error('Error al actualizar la propuesta:', error);
      setIsLoading(false);
      alert(`Error al actualizar la propuesta: ${error.message}`);
    });
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      <PropuestasHeader titulo="Etapa : Pre-Conciliada" onBack={() => navigate('/main/propuestas')} />

      <PropuestaResumen
        propuesta={propuesta}
        formatearFecha={formatearFecha}
        handleConfirmarCambios={() => setShowConfirm(true)}
      />

      <Tabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        mesConciliacion={mesConciliacion} 
      />
      
      {/* Mostrar el modal de carga mientras isLoading es true */}
      {isLoading ? (
        <LoadingModal />
      ) : (
        <>
          {activeTab === 'solicitudes' && (
            <SolicitudesAprobacion 
              propuesta={propuestaId}
            />
          )}
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
                  estado={activeTab}
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
              estado={activeTab}/>
          )}
        </>
      )}
      
      {/* Se eliminan los modales para solicitudes ya que ahora se manejan desde el componente SolicitudesAprobacion */}
      
      {/* Modal de confirmación para finalizar proceso completo */}
      <ModalConfirmacion
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmarTodosCambios}
        title="Confirmar cambios"
        message="¿Estás seguro de que deseas confirmar todos los cambios y marcar la propuesta como conciliada? Esta acción no se puede deshacer."
        confirmText="Confirmar cambios"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default DAFPreConciliado;
