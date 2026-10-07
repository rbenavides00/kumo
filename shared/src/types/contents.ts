import type { FileItem } from "./file.js";
import type { FolderItem } from "./folder.js";

export type ContentFilter = "myFiles" | "sharedWithMe";

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type FolderContents = {
  isOwner: boolean;
  folders: FolderItem[];
  files: FileItem[];
  pagination: Pagination;
};
