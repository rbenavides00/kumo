import api from "./client";

export async function getProfile() {
  const { data } = await api.get("/users/me");
  return data;
}

export async function updateProfile(firstName, lastName) {
  const { data } = await api.patch("/users/me", { firstName, lastName });
  return data;
}

export async function updateAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.patch("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updatePassword(currentPassword, newPassword) {
  const { data } = await api.patch("/users/me/password", {
    currentPassword,
    newPassword,
  });
  return data;
}

export function getAvatarUrl() {
  return "/users/me/avatar";
}
