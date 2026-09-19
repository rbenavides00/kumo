import { Dices, FileText, House, Settings, UserPlus } from "lucide-react";

export const NAV_ITEMS = [
  { id: "home", icon: House, text: "Home", to: "/" },
  { id: "files", icon: FileText, text: "My files", to: "/files" },
  { id: "shared", icon: UserPlus, text: "Shared with me", to: "/shared" },
  { id: "settings", icon: Settings, text: "Settings", to: "/settings" },
  // { id: "gambling", icon: Dices, text: "Gambling", to: "/gambling" }, // Ignore
];
