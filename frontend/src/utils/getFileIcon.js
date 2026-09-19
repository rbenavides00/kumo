import { File } from "lucide-react";

import { ICON_BY_EXTENSION } from "../constants/fileIcons";

export function getFileIcon(extension) {
  return ICON_BY_EXTENSION[extension?.toLowerCase()] ?? File;
}
