import type { ShareStatus } from "./share.js";
import type { User } from "./user.js";

export type FileCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive"
  | "other";

export type FileItem = {
  id: number;
  name: string;
  extension: string;
  category: FileCategory;
  size: number;
  isPublic: boolean;
  folderId: number | null;
  uploadedAt: string; // ISO 8601
  shareStatus: ShareStatus;
  owner: User | null;
};

export type CreatedFile = Pick<
  FileItem,
  "id" | "name" | "extension" | "category" | "folderId" | "size"
>;
