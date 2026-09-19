import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";

const EXTENSION_GROUPS = [
  { icon: FileImage, extensions: ["png", "jpg", "jpeg", "gif", "svg", "webp"] },
  { icon: FileVideo, extensions: ["mp4", "mov", "avi", "mkv", "webm"] },
  { icon: FileAudio, extensions: ["mp3", "wav", "ogg", "flac"] },
  { icon: FileText, extensions: ["pdf", "doc", "docx", "txt", "md"] },
  { icon: FileSpreadsheet, extensions: ["xls", "xlsx", "csv"] },
  { icon: FileArchive, extensions: ["zip", "rar", "7z", "tar", "gz"] },
  {
    icon: FileCode,
    extensions: [
      "js",
      "jsx",
      "ts",
      "tsx",
      "json",
      "html",
      "css",
      "py",
      "java",
      "jar",
    ],
  },
];

export const ICON_BY_EXTENSION = Object.fromEntries(
  EXTENSION_GROUPS.flatMap(({ icon, extensions }) =>
    extensions.map((extension) => [extension, icon]),
  ),
);
