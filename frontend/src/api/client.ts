import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Request: Append token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: if token is invalid/expired, clean session and notify app
api.interceptors.response.use(
  (response) => response,
  (err: unknown) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(err);
  },
);

export default api;
