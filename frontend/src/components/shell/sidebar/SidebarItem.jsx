import { NavLink } from "react-router-dom";

function SidebarItem({ icon: Icon, text, to, isExpanded }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center rounded-lg p-2 transition-colors ${
          isActive
            ? "bg-gray-200 text-gray-900"
            : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
        } ${isExpanded ? "gap-3" : "justify-center"}`
      }
    >
      <Icon size={20} className="shrink-0" />
      {isExpanded && <span className="whitespace-nowrap">{text}</span>}
    </NavLink>
  );
}

export default SidebarItem;
