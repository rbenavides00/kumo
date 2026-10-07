import type { FileCategory } from "@kumo/shared";

const EXTENSIONS: Record<Exclude<FileCategory, "other">, string[]> = {
  image: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "bmp",
    "ico",
    "heic",
    "avif",
    "tiff",
  ],
  video: ["mp4", "mkv", "mov", "avi", "webm", "wmv", "flv", "m4v"],
  audio: ["mp3", "wav", "flac", "aac", "ogg", "m4a", "opus"],
  document: [
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "odt",
    "ods",
    "odp",
    "txt",
    "md",
    "rtf",
    "csv",
  ],
  archive: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"],
};

const LOOKUP = new Map<string, FileCategory>(
  Object.entries(EXTENSIONS).flatMap(([category, extensions]) =>
    extensions.map((extension): [string, FileCategory] => [
      extension,
      category as FileCategory,
    ]),
  ),
);

export function getFileCategory(extension: string): FileCategory {
  return LOOKUP.get(extension.toLowerCase()) ?? "other";
}
