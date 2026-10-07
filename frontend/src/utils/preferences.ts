import type { ContentFilter } from "@kumo/shared";

export type Preference<T extends string> = {
  key: string;
  fallback: T;
  allowed: readonly T[];
};

export type FilesView = "list" | "grid";

export const FILES_VIEW: Preference<FilesView> = {
  key: "files-view",
  fallback: "list",
  allowed: ["list", "grid"],
};

export const FILES_FILTER: Preference<ContentFilter> = {
  key: "files-filter",
  fallback: "myFiles",
  allowed: ["myFiles", "sharedWithMe"],
};
