import api from "@/api/client";

export async function getContents(
  folderId = null,
  filter = "myFiles",
  page = 1,
  pageSize,
) {
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  const url = folderId ? `/folders/${folderId}/contents` : "/folders/contents";
  const { data } = await api.get(url, { params: { filter, page, pageSize } });
  return data;
}

export async function createFolder(name, parentId = null) {
  const { data } = await api.post("/folders", { name, parentId });
  return data;
}

export async function renameFolder(id, name) {
  const { data } = await api.patch(`/folders/${id}`, { name });
  return data;
}

export async function deleteFolder(id) {
  const { data } = await api.delete(`/folders/${id}`);
  return data;
}
