import { NavLink } from "react-router-dom";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NAV_ITEMS } from "@/constants/navigation";

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
                    `${className} ${isActive ? "bg-sidebar-accent" : ""}`
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
