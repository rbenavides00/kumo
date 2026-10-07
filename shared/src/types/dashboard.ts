import type { FileCategory, FileItem } from "./file.js";
import type { ShareStatus } from "./share.js";

export type DashboardFile = FileItem & { category: FileCategory };

export type CategoryStat = {
  category: FileCategory;
  count: number;
  size: number; // bytes
};

export type DashboardData = {
  storage: { used: number; quota: number | null };
  categories: CategoryStat[];
  sharing: Record<ShareStatus, number>;
  recentFiles: DashboardFile[];
  largestFiles: DashboardFile[];
  sharedWithMe: DashboardFile[];
};
