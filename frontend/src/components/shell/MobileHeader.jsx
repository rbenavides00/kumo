import { Menu } from "lucide-react";

function MobileHeader({ title, onOpenSidebar }) {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-200 px-4 md:hidden">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
      >
        <Menu size={22} />
      </button>
      <span className="text-lg font-semibold text-gray-800">{title}</span>
    </div>
  );
}

export default MobileHeader;
