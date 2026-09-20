import { FileText, House, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { id: "home", icon: House, text: "Home", to: "/" },
  { id: "files", icon: FileText, text: "Files", to: "/files" },
  { id: "settings", icon: Settings, text: "Settings", to: "/settings" },
];
