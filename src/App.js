import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

// Contextos
import { RoleProvider } from "./context/RoleContext";
import { PropuestasProvider } from "./context/PropuestasContext";
import { ProgramasProvider } from "./context/ProgramasContext";
import { ConciliacionProvider } from "./context/ConciliacionContext";

// Páginas principales
import PaginaPrincipal from "./pages/PaginaPrincipal";
import PaginaPropuestas from "./pages/PaginaPropuestas";
import PaginaConciliaciones from "./pages/PaginaConciliaciones";

// ADMIN
import AdministradorGenerada from "./pages/propuestas/ADMIN/AdministradorGenerada";
import AdministradorPreConciliado from "./pages/propuestas/ADMIN/AdministradorPreConciliado";
import AdministradorConciliado from "./pages/propuestas/ADMIN/AdministradorConciliado";
import AdministradorCancelado from "./pages/propuestas/ADMIN/AdministradorCancelado";

// JP
import JPPreConciliado from "./pages/propuestas/JP/JPPreConciliado";
import JPConciliado from "./pages/propuestas/JP/JPConciliado";

// Subdirector
import SubdirectorPreConciliado from "./pages/propuestas/SD/SubdirectorPreConciliado";
import SubdirectorConciliado from "./pages/propuestas/SD/SubdirectorConciliado";

// DAF
import DAFGenerada from "./pages/propuestas/DAF/DAFGenerada";
import DAFPreConciliado from "./pages/propuestas/DAF/DAFPreConciliado";
import DAFConciliado from "./pages/propuestas/DAF/DAFConciliado";

// DAF-SD
import DAFSDAutorizacion from "./pages/propuestas/DAF/DAF-SDAutorizacion";

import "./App.css";

// Configuración del router con future flag activado
const router = createBrowserRouter(
  [
    { path: "/", element: <Navigate to="/main" replace /> },
    { path: "/main", element: <PaginaPrincipal /> },
    { path: "/main/propuestas", element: <PaginaPropuestas /> },
    { path: "/main/conciliaciones", element: <PaginaConciliaciones /> },

    // ADMIN
    {
      path: "/propuesta/administrador/generada/:propuestaId",
      element: <AdministradorGenerada />,
    },
    {
      path: "/propuesta/administrador/PRECONCILIADA/:propuestaId",
      element: <AdministradorPreConciliado />,
    },
    {
      path: "/propuesta/administrador/conciliado/:propuestaId",
      element: <AdministradorConciliado />,
    },
    {
      path: "/propuesta/administrador/cancelado/:propuestaId",
      element: <AdministradorCancelado />,
    },

    // DAF - Supervisor
    {
      path: "/propuesta/DAF - Supervisor/generada/:propuestaId",
      element: <DAFGenerada />,
    },
    {
      path: "/propuesta/DAF - Supervisor/PRECONCILIADA/:propuestaId",
      element: <DAFPreConciliado />,
    },
    {
      path: "/propuesta/DAF - Supervisor/conciliado/:propuestaId",
      element: <DAFConciliado />,
    },

    // DAF - Subdirector
    {
      path: "/propuesta/DAF - Subdirector/generada/:propuestaId",
      element: <DAFGenerada />,
    },
    {
      path: "/propuesta/DAF - Subdirector/PRECONCILIADA/:propuestaId",
      element: <DAFPreConciliado />,
    },
    {
      path: "/propuesta/DAF - Subdirector/autorizacion/:propuestaId",
      element: <DAFSDAutorizacion />,
    },
    {
      path: "/propuesta/DAF - Subdirector/conciliado/:propuestaId",
      element: <DAFConciliado />,
    },

    // JP
    {
      path: "/propuesta/Comercial - Jefe de producto/PRECONCILIADA/:propuestaId",
      element: <JPPreConciliado />,
    },
    {
      path: "/propuesta/Comercial - Jefe de producto/conciliado/:propuestaId",
      element: <JPConciliado />,
    },

    // Comercial - Subdirector
    {
      path: "/propuesta/Comercial - Subdirector/PRECONCILIADA/:propuestaId",
      element: <SubdirectorPreConciliado />,
    },
    {
      path: "/propuesta/Comercial - Subdirector/conciliado/:propuestaId",
      element: <SubdirectorConciliado />,
    },
  ],
  {
    future: {
      v7_normalizeFormMethod: true,
      v7_fetcherPersist: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
      v7_partialHydration: true,
      v7_startTransition: true, // este ya lo tenías
    },
  }
);

function App() {
  return (
    <RoleProvider>
      <PropuestasProvider>
        <ProgramasProvider>
          <ConciliacionProvider>
            <RouterProvider router={router} />
          </ConciliacionProvider>
        </ProgramasProvider>
      </PropuestasProvider>
    </RoleProvider>
  );
}

export default App;
