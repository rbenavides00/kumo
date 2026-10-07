import type {
  LoginBody,
  LoginResponse,
  MessageResponse,
  RegisterBody,
} from "@kumo/shared";

import api from "@/api/client";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const body: LoginBody = { username, password };
  const { data } = await api.post<LoginResponse>("/auth/login", body);

  return data;
}

export async function register(
  username: string,
  password: string,
): Promise<MessageResponse> {
  const body: RegisterBody = { username, password };
  const { data } = await api.post<MessageResponse>("/auth/register", body);

  return data;
}
