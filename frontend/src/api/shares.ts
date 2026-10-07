import type {
  ItemType,
  ShareSettings,
  UpdateShareSettingsBody,
} from "@kumo/shared";

import api from "@/api/client";

export async function getShareSettings(
  itemType: ItemType,
  itemId: number,
): Promise<ShareSettings> {
  const { data } = await api.get<ShareSettings>(
    `/shares/${itemType}/${itemId}`,
  );

  return data;
}

export async function updateShareSettings(
  itemType: ItemType,
  itemId: number,
  { isPublic, sharedWith }: UpdateShareSettingsBody,
): Promise<ShareSettings> {
  const { data } = await api.patch<ShareSettings>(
    `/shares/${itemType}/${itemId}`,
    { isPublic, sharedWith },
  );

  return data;
}
