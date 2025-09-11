import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatearFecha, obtenerColorEstado } from '../../../utils/mockData';

const SubdirectorPreConciliado = () => {
  const navigate = useNavigate();
  const { propuestaId } = useParams();

  const propuesta = {
    id: propuestaId,
    nombre: `Propuesta_${propuestaId}`,
    fecha_propuesta: new Date(),
    estado: 'pre-conciliado',
    carteras: ['Cartera Comercial', 'Cartera Personal'],
    fecha_creacion: new Date(),
    fecha_actualizacion: new Date()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-light via-background-subtle to-white">
      Aca ira la pantalla de las solicitudes de aprobacion de los JP
    </div>
  );
};

export default SubdirectorPreConciliado;
