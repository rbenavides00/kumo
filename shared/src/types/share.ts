import type { User } from "./user.js";

export type ItemType = "file" | "folder";
export type ShareStatus = "public" | "shared" | "private";

export type ShareSettings = {
  isPublic: boolean;
  status: ShareStatus;
  sharedWith: User[];
};

export type UpdateShareSettingsBody = {
  isPublic: boolean;
  sharedWith: number[];
};
