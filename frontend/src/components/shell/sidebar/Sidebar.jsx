import { NavLink } from "react-router-dom";
import { ArrowLeftToLine, ArrowRightToLine, X } from "lucide-react";

import { useUser } from "../../../context/UserContext";
import useDisclosure from "../../../hooks/useDisclosure";
import SidebarBackdrop from "./SidebarBackdrop";
import SidebarItem from "./SidebarItem";
import Avatar from "../../ui/Avatar";

function Sidebar({ items, title, isMobileOpen, onCloseMobile, onSignOut }) {
  const { isOpen: isExpanded, toggle: toggleExpanded } = useDisclosure(true);

  // On mobile, the sidebar is always displayed expanded (with text)
  const showLabels = isExpanded || isMobileOpen;

  return (
    <>
      {isMobileOpen && <SidebarBackdrop onClick={onCloseMobile} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 shrink-0 flex-col bg-gray-100 transition-transform duration-300 md:static md:z-auto md:translate-x-0 md:transition-[width] ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isExpanded ? "md:w-64" : "md:w-20"}`}
      >
        <SidebarHeader
          title={title}
          isExpanded={isExpanded}
          onToggleExpanded={toggleExpanded}
          onCloseMobile={onCloseMobile}
        />

        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              text={item.text}
              to={item.to}
              isExpanded={showLabels}
            />
          ))}
        </nav>

        <SidebarAccount isExpanded={showLabels} onSignOut={onSignOut} />
      </aside>
    </>
  );
}

function SidebarHeader({ title, isExpanded, onToggleExpanded, onCloseMobile }) {
  return (
    <div
      className={`flex h-16 px-4 items-center ${isExpanded ? "justify-between" : "justify-center"}`}
    >
      {isExpanded && (
        <span className="text-lg font-semibold whitespace-nowrap text-gray-800">
          {title}
        </span>
      )}

      {/* Collapse/expand: desktop only */}
      <button
        type="button"
        onClick={onToggleExpanded}
        className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-900 md:block"
      >
        {isExpanded ? (
          <ArrowLeftToLine size={22} />
        ) : (
          <ArrowRightToLine size={22} />
        )}
      </button>

      {/* Close: mobile only */}
      <button
        type="button"
        onClick={onCloseMobile}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-900 md:hidden"
      >
        <X size={22} />
      </button>
    </div>
  );
}

function SidebarAccount({ isExpanded, onSignOut }) {
  const { user, avatarUrl } = useUser();

  return (
    <div className="mt-auto p-3">
      <div
        className={`flex items-center ${isExpanded ? "justify-between" : "justify-center"}`}
      >
        <NavLink
          to="/profile"
          className="group flex rounded-full p-0.5 transition-all duration-200 hover:bg-gray-500/20 hover:ring-2 hover:ring-gray-300/50"
        >
          <Avatar user={user} avatarUrl={avatarUrl} size="sm" />
        </NavLink>

        {isExpanded && (
          <button
            type="button"
            onClick={onSignOut}
            className="cursor-pointer text-sm whitespace-nowrap text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
