import {
  Archive,
  File,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { FileCategory } from "@kumo/shared";

export const CATEGORY_META: Record<
  FileCategory,
  { label: string; icon: LucideIcon; color: string }
> = {
  image: { label: "Images", icon: ImageIcon, color: "var(--chart-1)" },
  video: { label: "Videos", icon: Video, color: "var(--chart-2)" },
  audio: { label: "Audio", icon: Music, color: "var(--chart-3)" },
  document: { label: "Documents", icon: FileText, color: "var(--chart-4)" },
  archive: { label: "Archives", icon: Archive, color: "var(--chart-5)" },
  other: { label: "Other", icon: File, color: "var(--muted-foreground)" },
};
