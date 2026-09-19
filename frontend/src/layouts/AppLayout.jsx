import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Sidebar from "../components/shell/sidebar/Sidebar";
import MobileHeader from "../components/shell/MobileHeader";
import { NAV_ITEMS } from "../constants/navigation";

const APP_TITLE = "KUMO";

function AppLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar
        title={APP_TITLE}
        items={NAV_ITEMS}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onSignOut={handleSignOut}
      />

      <section className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader
          title={APP_TITLE}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <div className="flex-1 overflow-auto p-4 md:pl-0">
          <Outlet />
        </div>
      </section>
    </main>
  );
}

export default AppLayout;
