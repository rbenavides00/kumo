import api from "./client";

export async function uploadFile(file, folderId = null) {
  const formData = new FormData();
  formData.append("file", file);
  if (folderId) formData.append("folderId", folderId);

  const { data } = await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function renameFile(id, name) {
  const { data } = await api.patch(`/files/${id}`, { name });
  return data;
}

export async function deleteFile(id) {
  const { data } = await api.delete(`/files/${id}`);
  return data;
}

export async function downloadFile(id, name) {
  const response = await api.get(`/files/${id}/download`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
