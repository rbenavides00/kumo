import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CurrentUser } from "@kumo/shared";

import * as usersApi from "@/api/users";
import { useAuth } from "@/context/AuthContext";

type Session = {
  token: string;
  user: CurrentUser;
  avatarUrl: string | null;
};

interface UserContextType {
  user: CurrentUser | null;
  avatarUrl: string | null;
  refreshUser: () => Promise<CurrentUser>;
}

const UserContext = createContext<UserContextType | null>(null);

async function fetchAvatarUrl(): Promise<string | null> {
  try {
    return URL.createObjectURL(await usersApi.getAvatar());
  } catch {
    return null;
  }
}

async function loadSession(token: string): Promise<Session> {
  const user = await usersApi.getProfile();
  const avatarUrl = user.hasAvatar ? await fetchAvatarUrl() : null;

  return { token, user, avatarUrl };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const avatarUrlRef = useRef<string | null>(null);

  const applySession = useCallback((next: Session) => {
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    avatarUrlRef.current = next.avatarUrl;
    setSession(next);
  }, []);

  const refreshUser = useCallback(async (): Promise<CurrentUser> => {
    if (!token) throw new Error("Not authenticated");

    const next = await loadSession(token);
    applySession(next);

    return next.user;
  }, [token, applySession]);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    loadSession(token)
      .then((next) => {
        if (cancelled) {
          if (next.avatarUrl) URL.revokeObjectURL(next.avatarUrl);
          return;
        }

        applySession(next);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [token, applySession]);

  const current = session && session.token === token ? session : null;

  const value: UserContextType = {
    user: current?.user ?? null,
    avatarUrl: current?.avatarUrl ?? null,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
