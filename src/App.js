import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { PropuestasProvider } from './context/PropuestasContext';
import { ProgramasProvider } from './context/ProgramasContext';
import PaginaPrincipal from './pages/PaginaPrincipal';
import PaginaPropuestas from './pages/PaginaPropuestas';
import PaginaConciliaciones from './pages/PaginaConciliaciones';

// Importar todas las pantallas específicas de propuestas
import AdministradorGenerada from './pages/propuestas/ADMIN/AdministradorGenerada';
import AdministradorPreConciliado from './pages/propuestas/ADMIN/AdministradorPreConciliado';
import AdministradorConciliado from './pages/propuestas/ADMIN/AdministradorConciliado';
import AdministradorCancelado from './pages/propuestas/ADMIN/AdministradorCancelado';
import JPGenerada from './pages/propuestas/JP/JPGenerada';
import JPPreConciliado from './pages/propuestas/JP/JPPreConciliado';
import JPConciliado from './pages/propuestas/JP/JPConciliado';
import SubdirectorPreConciliado from './pages/propuestas/SD/SubdirectorPreConciliado';
import SubdirectorConciliado from './pages/propuestas/SD/SubdirectorConciliado';
import VerPropuesta from './pages/VerPropuesta';

// Importar nuevas pantallas DAF-SD
import DAFSDAutorizacion from './pages/propuestas/DAF/DAF-SDAutorizacion';
import DAFGenerada from './pages/propuestas/DAF/DAFGenerada';
import DAFPreConciliado from './pages/propuestas/DAF/DAFPreConciliado';
import DAFConciliado from './pages/propuestas/DAF/DAFConciliado';

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
                <Route path="/propuesta/administrador/cancelado/:propuestaId" element={<AdministradorCancelado />} />
                
                {/* DAF */}
                <Route path="/propuesta/daf/generada/:propuestaId" element={<DAFGenerada />} />
                <Route path="/propuesta/daf/pre-conciliado/:propuestaId" element={<DAFPreConciliado />} />
                <Route path="/propuesta/daf/conciliado/:propuestaId" element={<DAFConciliado />} />
                
                {/* DAF-SD */}
                <Route path="/propuesta/daf-sd/generada/:propuestaId" element={<DAFGenerada />} />
                <Route path="/propuesta/daf-sd/pre-conciliado/:propuestaId" element={<DAFPreConciliado />} />
                <Route path="/propuesta/daf-sd/autorizacion/:propuestaId" element={<DAFSDAutorizacion />} />
                <Route path="/propuesta/daf-sd/conciliado/:propuestaId" element={<DAFConciliado />} />                
                {/* JP */}
                <Route path="/propuesta/jp/generada/:propuestaId" element={<JPGenerada />} />
                <Route path="/propuesta/jp/pre-conciliado/:propuestaId" element={<JPPreConciliado />} />
                <Route path="/propuesta/jp/conciliado/:propuestaId" element={<JPConciliado />} />
                {/* Subdirector */}
                <Route path="/propuesta/subdirector/pre-conciliado/:propuestaId" element={<SubdirectorPreConciliado />} />
                <Route path="/propuesta/subdirector/conciliado/:propuestaId" element={<SubdirectorConciliado />} />
                
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
