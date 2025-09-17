import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const ToggleIcon = ({ collapsed }) => (
  <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {collapsed ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    )}
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const navSections = [
  {
    label: "Conciliacion",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10l9-7 9 7v9a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4H9v4a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    ),
    items: [
      {
        label: "Dashboard",
        to: "/main/dashboard",
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 13h16M4 9h16M10 5h4m-8 8v6a1 1 0 001 1h3a1 1 0 001-1v-6m6 0v6a1 1 0 001 1h3a1 1 0 001-1v-6" />
          </svg>
        ),
      },
      {
        label: "Propuestas",
        to: "/main/propuestas",
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 5h16v4H4zm0 6h16v8H4zm4 3h2m2 0h2" />
          </svg>
        ),
      },
      {
        label: "Conciliados",
        to: "/main/conciliaciones",
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4a1 1 0 011-1h3.28a1 1 0 01.948.684l.84 2.632a1 1 0 00.95.684h3.084a1 1 0 01.95.684l.572 1.876A1 1 0 0016.428 10H20a1 1 0 011 1v2h-2.382a1 1 0 00-.894.553l-.447.894a1 1 0 01-.894.553H13a1 1 0 00-.894.553l-.276.553A1 1 0 0110.936 16H5a1 1 0 01-1-1V4z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Servicio 2",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 18h16M4 12h10" />
      </svg>
    ),
    items: [
      {
        label: "Submenu 1",
        to: "/servicio2/submenu1",
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v12m6-6H6" />
          </svg>
        ),
      },
      {
        label: "Submenu 2",
        to: "/servicio2/submenu2",
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="4" strokeWidth={1.8} />
          </svg>
        ),
      },
      {
        label: "Submenu 3",
        to: "/servicio2/submenu3",
        icon: (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h10M4 17h7" />
          </svg>
        ),
      },
    ],
  },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { pathname } = useLocation();
  const sidebarRef = useRef(null);

  const computeOpenStates = (path) =>
    navSections.map((section) => {
      const isMatch = section.items.some((item) => path === item.to || path.startsWith(`${item.to}/`));
      return isMatch;
    });

  const [openSections, setOpenSections] = useState(() => computeOpenStates(pathname));

  useEffect(() => {
    setOpenSections(computeOpenStates(pathname));
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenSections(navSections.map(() => false));
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  const toggleSection = (index) => {
    setOpenSections((prev) => prev.map((open, idx) => (idx === index ? !open : false)));
  };

  return (
    <aside ref={sidebarRef}
      className={`relative z-[2000] h-screen border-r border-slate-200 bg-slate-200/25 backdrop-blur shadow-lg transition-all duration-300 ease-in-out ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between px-4 py-4">
          {!collapsed && (
            <span className="text-sm font-semibold text-slate-600 tracking-wide">PUCP</span>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:bg-slate-50"
            aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            <ToggleIcon collapsed={collapsed} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 px-2 pt-2">
          {navSections.map((section, index) => {
            const isOpen = openSections[index];
            const isSectionActive = section.items.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
            return (
              <div key={section.label} className="relative">
                <button
                  type="button"
                  onClick={() => toggleSection(index)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-slate-50 ${
                    isSectionActive ? "border border-sky-200 bg-sky-100 text-sky-600" : "border border-transparent text-slate-600"
                  }`}
                  aria-expanded={isOpen}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 ${
                      collapsed ? "mx-auto" : ""
                    }`}
                  >
                    {section.icon}
                  </span>
                  {!collapsed && <span className="flex-1 text-left">{section.label}</span>}
                  {!collapsed && <ChevronIcon open={isOpen} />}
                </button>

                {isOpen && (
                  <div
                    className={
                      collapsed
                        ? "absolute left-full top-0 ml-3 w-48 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-[4000]"
                        : "mt-1 space-y-1 pl-10 relative z-[4000]"
                    }
                  >
                    {section.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) => [
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-sky-500 text-white shadow-sm"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                        ].join(" ")}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-2 pb-4">
          <button
            type="button"
            className="mt-3 flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 shadow-sm transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9l3 3-3 3m9-3H9" />
              </svg>
            </span>
            {!collapsed && <span>Cerrar sesion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;




