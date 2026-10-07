import type {
  CurrentUser,
  MessageResponse,
  User,
  UpdatePasswordBody,
  UpdateProfileBody,
} from "@kumo/shared";

import api from "@/api/client";

export async function listUsers(search = ""): Promise<User[]> {
  const { data } = await api.get<User[]>("/users", {
    params: { search },
  });

  return data;
}

export async function getProfile(): Promise<CurrentUser> {
  const { data } = await api.get<CurrentUser>("/users/me");

  return data;
}

export async function updateProfile(
  firstName: string,
  lastName: string,
): Promise<CurrentUser> {
  const body: UpdateProfileBody = { firstName, lastName };
  const { data } = await api.patch<CurrentUser>("/users/me", body);

  return data;
}

export async function updateAvatar(file: File): Promise<CurrentUser> {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.patch<CurrentUser>("/users/me/avatar", formData);

  return data;
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<MessageResponse> {
  const body: UpdatePasswordBody = { currentPassword, newPassword };
  const { data } = await api.patch<MessageResponse>("/users/me/password", body);

  return data;
}

/** Imagen de avatar: del usuario indicado, o del actual si no se pasa id. */
export async function getAvatar(userId?: number): Promise<Blob> {
  const path = userId === undefined ? "/users/me" : `/users/${userId}`;
  const { data } = await api.get<Blob>(`${path}/avatar`, {
    responseType: "blob",
  });

  return data;
}
