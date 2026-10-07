import type { ShareStatus } from "./share.js";
import type { User } from "./user.js";

export type FileItem = {
  id: number;
  name: string;
  extension: string;
  size: number;
  isPublic: boolean;
  folderId: number | null;
  uploadedAt: string; // ISO 8601
  shareStatus: ShareStatus;
  owner: User | null;
};

export type CreatedFile = Pick<
  FileItem,
  "id" | "name" | "extension" | "folderId" | "size"
>;
