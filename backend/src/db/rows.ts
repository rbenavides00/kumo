export type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  avatar_path: string | null;
  created_at: string;
};

export type PublicUserRow = Pick<
  UserRow,
  "id" | "username" | "first_name" | "last_name" | "avatar_path"
>;

export type FolderRow = {
  id: number;
  owner_id: number;
  parent_id: number | null;
  name: string;
  is_public: number; // 0 | 1
  created_at: string;
};

export type FileRow = {
  id: number;
  owner_id: number;
  folder_id: number | null;
  name: string;
  extension: string;
  stored_name: string;
  size: number;
  is_public: number; // 0 | 1
  uploaded_at: string;
};

export type FileListRow = Omit<FileRow, "stored_name">;
