import { Outlet } from "react-router-dom";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import AppSidebar from "@/layouts/sidebar/AppSidebar";

const APP_TITLE = "KUMO";

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar title={APP_TITLE} />

      <SidebarInset>
        <header className="flex items-center gap-2 border-b p-2 md:hidden">
          <SidebarTrigger />
          <span className="font-bold">{APP_TITLE}</span>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default AppLayout;
