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
import DAFSubdirectorAPROBACION from "./pages/propuestas/SD/DAFSubdirectorAPROBACION";

import "./App.css";
import AppLayout from "./components/layout/AppLayout";

// Configuración del router con future flag activado
const router = createBrowserRouter(
  [
    { path: "/", element: <Navigate to="/main/dashboard" replace /> },
    { path: "/main/dashboard", element: <AppLayout><PaginaPrincipal /></AppLayout> },
    { path: "/main/propuestas", element: <AppLayout><PaginaPropuestas /></AppLayout> },
    { path: "/main/conciliaciones", element: <AppLayout><PaginaConciliaciones /></AppLayout> },

    // ADMIN
    {
      path: "/propuesta/administrador/generada/:propuestaId",
      element: <AppLayout><AdministradorGenerada /></AppLayout>,
    },
    {
      path: "/propuesta/administrador/PRECONCILIADA/:propuestaId",
      element: <AppLayout><AdministradorPreConciliado /></AppLayout>,
    },
    {
      path: "/propuesta/administrador/conciliado/:propuestaId",
      element: <AppLayout><AdministradorConciliado /></AppLayout>,
    },
    {
      path: "/propuesta/administrador/cancelado/:propuestaId",
      element: <AppLayout><AdministradorCancelado /></AppLayout>,
    },

    // DAF - Supervisor
    {
      path: "/propuesta/DAF - Supervisor/generada/:propuestaId",
      element: <AppLayout><DAFGenerada /></AppLayout>,
    },
    {
      path: "/propuesta/DAF - Supervisor/PRECONCILIADA/:propuestaId",
      element: <AppLayout><DAFPreConciliado /></AppLayout>,
    },
    {
      path: "/propuesta/DAF - Supervisor/conciliado/:propuestaId",
      element: <AppLayout><DAFConciliado /></AppLayout>,
    },

    // DAF - Subdirector
    {
      path: "/propuesta/DAF - Subdirector/generada/:propuestaId",
      element: <AppLayout><DAFGenerada /></AppLayout>,
    },
    {
      path: "/propuesta/DAF - Subdirector/PRECONCILIADA/:propuestaId",
      element: <AppLayout><DAFPreConciliado /></AppLayout>,
    },
    {
      path: "/propuesta/DAF - Subdirector/APROBACION/:propuestaId",
      element: <AppLayout><DAFSubdirectorAPROBACION /></AppLayout>,
    },
    {
      path: "/propuesta/DAF - Subdirector/conciliado/:propuestaId",
      element: <AppLayout><DAFConciliado /></AppLayout>,
    },

    // JP
    {
      path: "/propuesta/Comercial - Jefe de producto/PRECONCILIADA/:propuestaId",
      element: <AppLayout><JPPreConciliado /></AppLayout>,
    },
    {
      path: "/propuesta/Comercial - Jefe de producto/conciliado/:propuestaId",
      element: <AppLayout><JPConciliado /></AppLayout>,
    },

    // Comercial - Subdirector
    {
      path: "/propuesta/Comercial - Subdirector/PRECONCILIADA/:propuestaId",
      element: <AppLayout><SubdirectorPreConciliado /></AppLayout>,
    },
    {
      path: "/propuesta/Comercial - Subdirector/conciliado/:propuestaId",
      element: <AppLayout><SubdirectorConciliado /></AppLayout>,
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
