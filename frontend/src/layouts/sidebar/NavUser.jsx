import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import UserAvatar from "@/components/shared/UserAvatar";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";

function NavUser() {
  const { logout } = useAuth();
  const { user, avatarUrl } = useUser();

  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          tooltip="Profile"
          render={<NavLink to="/profile" />}
        >
          <UserAvatar user={user} src={avatarUrl} />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">@{user.username}</span>
            {/* <span className="truncate text-xs">{user.email}</span> */}
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton onClick={handleSignOut} tooltip="Sign out">
          <LogOut />
          <span>Sign out</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default NavUser;
