import React, { useState } from "react";
import Sidebar from "./Sidebar";

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <main className="flex-1 min-h-screen overflow-y-auto bg-slate-50 transition-all duration-300 ease-in-out">
        <div className="w-full px-0 py-0">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;
