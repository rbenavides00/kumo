import type { ComponentProps } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import NavMain from "@/layouts/sidebar/NavMain";
import NavUser from "@/layouts/sidebar/NavUser";

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  title: string;
};

function AppSidebar({ title, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="flex flex-row items-center justify-between">
        <span className="px-2 font-bold group-data-[collapsible=icon]:hidden">
          {title}
        </span>
        <SidebarTrigger />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
