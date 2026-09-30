import api from "./client";

export async function getShareSettings(itemType, itemId) {
  const { data } = await api.get(`/shares/${itemType}/${itemId}`);
  return data;
}

export async function updateShareSettings(
  itemType,
  itemId,
  { isPublic, sharedWith },
) {
  const { data } = await api.patch(`/shares/${itemType}/${itemId}`, {
    isPublic,
    sharedWith,
  });
  return data;
}
