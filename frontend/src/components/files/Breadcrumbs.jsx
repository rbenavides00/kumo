import { Home } from "lucide-react";

function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
      <button
        type="button"
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1 rounded px-1.5 py-1 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <Home size={14} />
        <span>Home</span>
      </button>

      {path.map((folder) => (
        <span key={folder.id} className="flex items-center gap-1">
          <span className="text-gray-300">/</span>
          <button
            type="button"
            onClick={() => onNavigate(folder.id)}
            className="rounded px-1.5 py-1 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          >
            {folder.name}
          </button>
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumbs;
