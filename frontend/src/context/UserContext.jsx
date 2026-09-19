import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import * as usersApi from "../api/users";
import api from "../api/client";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const loadAvatar = useCallback(async (hasAvatar) => {
    if (!hasAvatar) {
      setAvatarUrl(null);
      return;
    }

    try {
      const { data } = await api.get("/users/me/avatar", {
        responseType: "blob",
      });
      setAvatarUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(data);
      });
    } catch {
      setAvatarUrl(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await usersApi.getProfile();
    setUser(profile);
    await loadAvatar(Boolean(profile.avatar_path));
    return profile;
  }, [loadAvatar]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    } else {
      setUser(null);
      setAvatarUrl(null);
    }
  }, [isAuthenticated]);

  const value = { user, avatarUrl, refreshUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
