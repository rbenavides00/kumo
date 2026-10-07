import type { CreatedFile, MessageResponse, RenameBody } from "@kumo/shared";

import api from "@/api/client";

export async function uploadFile(
  file: File,
  folderId: number | null = null,
): Promise<CreatedFile> {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId !== null) formData.append("folderId", String(folderId));

  // Con FormData, axios añade el Content-Type (con boundary) por su cuenta
  const { data } = await api.post<CreatedFile>("/files/upload", formData);

  return data;
}

export async function renameFile(
  id: number,
  name: string,
): Promise<MessageResponse> {
  const body: RenameBody = { name };
  const { data } = await api.patch<MessageResponse>(`/files/${id}`, body);

  return data;
}

export async function deleteFile(id: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/files/${id}`);

  return data;
}

export async function downloadFile(id: number, name: string): Promise<void> {
  const { data } = await api.get<Blob>(`/files/${id}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
