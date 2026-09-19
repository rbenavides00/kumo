import api from "./client";

export async function login(username, password) {
  return api.post("/auth/login", { username, password }).then((res) => res.data);
}

export async function register(username, password) {
  return api.post("/auth/register", { username, password }).then((res) => res.data);
}
