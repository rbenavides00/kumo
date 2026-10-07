import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { FileText, House, Settings } from "lucide-react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  icon: LucideIcon;
  title: string;
  url: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "home", icon: House, title: "Home", url: "/" },
  { id: "files", icon: FileText, title: "Files", url: "/files" },
  { id: "settings", icon: Settings, title: "Settings", url: "/settings" },
];

function NavMain() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {NAV_ITEMS.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              tooltip={item.title}
              render={({ className, ...props }) => (
                <NavLink
                  {...props}
                  to={item.url}
                  className={({ isActive }) =>
                    cn(className, isActive && "bg-sidebar-accent")
                  }
                />
              )}
            >
              <item.icon />
              {item.title}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
