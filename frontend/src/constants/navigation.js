import { Dices, FileText, House, Settings, UserPlus } from "lucide-react";

export const NAV_ITEMS = [
  { id: "home", icon: House, text: "Home", to: "/" },
  { id: "files", icon: FileText, text: "Files", to: "/files" },
  { id: "settings", icon: Settings, text: "Settings", to: "/settings" },
  // { id: "gambling", icon: Dices, text: "Gambling", to: "/gambling" }, // Ignore
];
