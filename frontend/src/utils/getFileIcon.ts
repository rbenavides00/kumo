import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  type LucideIcon,
} from "lucide-react";

export const ICON_BY_EXTENSION: Record<string, LucideIcon> = {
  // Images
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  webp: FileImage,

  // Videos
  mp4: FileVideo,
  mov: FileVideo,
  avi: FileVideo,
  mkv: FileVideo,
  webm: FileVideo,

  // Audio
  mp3: FileAudio,
  wav: FileAudio,
  ogg: FileAudio,
  flac: FileAudio,

  // Documents
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  md: FileText,

  // Spreadsheets
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,

  // Archives
  zip: FileArchive,
  rar: FileArchive,
  "7z": FileArchive,
  tar: FileArchive,
  gz: FileArchive,

  // Code
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  json: FileCode,
  html: FileCode,
  css: FileCode,
  py: FileCode,
  java: FileCode,
  jar: FileCode,
};

export function getFileIcon(extension?: string): LucideIcon {
  const normalizedExtension = extension?.toLowerCase().replace(/^\./, "");

  return ICON_BY_EXTENSION[normalizedExtension ?? ""] ?? File;
}
