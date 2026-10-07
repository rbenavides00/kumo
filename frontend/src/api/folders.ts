import type {
  ContentFilter,
  CreateFolderBody,
  CreatedFolder,
  FolderContents,
  MessageResponse,
  RenameBody,
} from "@kumo/shared";

import api from "@/api/client";

export async function getContents(
  folderId: number | null = null,
  filter: ContentFilter = "myFiles",
  page = 1,
  pageSize: number,
): Promise<FolderContents> {
  const url = folderId ? `/folders/${folderId}/contents` : "/folders/contents";
  const { data } = await api.get<FolderContents>(url, {
    params: { filter, page, pageSize },
  });

  return data;
}

export async function createFolder(
  name: string,
  parentId: number | null = null,
): Promise<CreatedFolder> {
  const body: CreateFolderBody = { name, parentId };
  const { data } = await api.post<CreatedFolder>("/folders", body);

  return data;
}

export async function renameFolder(
  id: number,
  name: string,
): Promise<MessageResponse> {
  const body: RenameBody = { name };
  const { data } = await api.patch<MessageResponse>(`/folders/${id}`, body);

  return data;
}

export async function deleteFolder(id: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/folders/${id}`);

  return data;
}
