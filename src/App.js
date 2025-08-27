import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { PropuestasProvider } from './context/PropuestasContext';
import { ProgramasProvider } from './context/ProgramasContext';
import PaginaPrincipal from './pages/PaginaPrincipal';
import PaginaPropuestas from './pages/PaginaPropuestas';
import PaginaConciliaciones from './pages/PaginaConciliaciones';

// Importar todas las pantallas específicas de propuestas
import AdministradorGenerada from './pages/propuestas/AdministradorGenerada';
import AdministradorPreConciliado from './pages/propuestas/AdministradorPreConciliado';
import AdministradorConciliado from './pages/propuestas/AdministradorConciliado';
import AdministradorProyectado from './pages/propuestas/AdministradorProyectado';
import AdministradorCancelado from './pages/propuestas/AdministradorCancelado';
import DAFGenerada from './pages/propuestas/DAFGenerada';
import DAFPreConciliado from './pages/propuestas/DAFPreConciliado';
import DAFConciliado from './pages/propuestas/DAFConciliado';
import DAFProyectado from './pages/propuestas/DAFProyectado';
import JPGenerada from './pages/propuestas/JPGenerada';
import JPPreConciliado from './pages/propuestas/JPPreConciliado';
import JPConciliado from './pages/propuestas/JPConciliado';
import JPProyectado from './pages/propuestas/JPProyectado';
import SubdirectorPreConciliado from './pages/propuestas/SubdirectorPreConciliado';
import SubdirectorConciliado from './pages/propuestas/SubdirectorConciliado';
import SubdirectorProyectado from './pages/propuestas/SubdirectorProyectado';
import VerPropuesta from './pages/VerPropuesta';

// Importar nuevas pantallas DAF-SD
import DAFSDGenerada from './pages/propuestas/DAF-SDGenerada';
import DAFSDPreConciliado from './pages/propuestas/DAF-SDPreConciliado';
import DAFSDAutorizacion from './pages/propuestas/DAF-SDAutorizacion';
import DAFSDConciliado from './pages/propuestas/DAF-SDConciliado';
import DAFSDProyectado from './pages/propuestas/DAF-SDProyectado';

import './App.css';

function App() {
  return (
    <RoleProvider>
      <PropuestasProvider>
        <ProgramasProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/" element={<Navigate to="/main" replace />} />
                <Route path="/main" element={<PaginaPrincipal />} />
                <Route path="/main/propuestas" element={<PaginaPropuestas />} />
                <Route path="/main/conciliaciones" element={<PaginaConciliaciones />} />
                
                {/* Rutas específicas para cada combinación de rol y estado */}
                {/* Administrador */}
                <Route path="/propuesta/administrador/generada/:propuestaId" element={<AdministradorGenerada />} />
                <Route path="/propuesta/administrador/pre-conciliado/:propuestaId" element={<AdministradorPreConciliado />} />
                <Route path="/propuesta/administrador/conciliado/:propuestaId" element={<AdministradorConciliado />} />
                <Route path="/propuesta/administrador/proyectado/:propuestaId" element={<AdministradorProyectado />} />
                <Route path="/propuesta/administrador/cancelado/:propuestaId" element={<AdministradorCancelado />} />
                
                {/* DAF */}
                <Route path="/propuesta/daf/generada/:propuestaId" element={<DAFGenerada />} />
                <Route path="/propuesta/daf/pre-conciliado/:propuestaId" element={<DAFPreConciliado />} />
                <Route path="/propuesta/daf/conciliado/:propuestaId" element={<DAFConciliado />} />
                <Route path="/propuesta/daf/proyectado/:propuestaId" element={<DAFProyectado />} />
                
                {/* DAF-SD */}
                <Route path="/propuesta/daf-sd/generada/:propuestaId" element={<DAFSDGenerada />} />
                <Route path="/propuesta/daf-sd/pre-conciliado/:propuestaId" element={<DAFSDPreConciliado />} />
                <Route path="/propuesta/daf-sd/autorizacion/:propuestaId" element={<DAFSDAutorizacion />} />
                <Route path="/propuesta/daf-sd/conciliado/:propuestaId" element={<DAFSDConciliado />} />
                <Route path="/propuesta/daf-sd/proyectado/:propuestaId" element={<DAFSDProyectado />} />
                
                {/* JP */}
                <Route path="/propuesta/jp/generada/:propuestaId" element={<JPGenerada />} />
                <Route path="/propuesta/jp/pre-conciliado/:propuestaId" element={<JPPreConciliado />} />
                <Route path="/propuesta/jp/conciliado/:propuestaId" element={<JPConciliado />} />
                <Route path="/propuesta/jp/proyectado/:propuestaId" element={<JPProyectado />} />
                
                {/* Subdirector */}
                <Route path="/propuesta/subdirector/pre-conciliado/:propuestaId" element={<SubdirectorPreConciliado />} />
                <Route path="/propuesta/subdirector/conciliado/:propuestaId" element={<SubdirectorConciliado />} />
                <Route path="/propuesta/subdirector/proyectado/:propuestaId" element={<SubdirectorProyectado />} />
                
                {/* Ruta para ver propuesta en modo solo lectura */}
                <Route path="/ver-propuesta/:propuestaId" element={<VerPropuesta />} />
              </Routes>
            </div>
          </Router>
        </ProgramasProvider>
      </PropuestasProvider>
    </RoleProvider>
  );
}

export default App;
