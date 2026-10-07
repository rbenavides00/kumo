import type { ShareStatus } from "./share.js";
import type { User } from "./user.js";

export type FolderItem = {
  id: number;
  name: string;
  parentId: number | null;
  isPublic: boolean;
  createdAt: string; // ISO 8601
  shareStatus: ShareStatus;
  owner: User | null;
};

export type CreateFolderBody = {
  name: string;
  parentId: number | null;
};

export type CreatedFolder = Pick<FolderItem, "id" | "name" | "parentId">;
