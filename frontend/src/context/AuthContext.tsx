import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import * as authApi from "@/api/auth";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      localStorage.removeItem("token");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const { token } = await authApi.login(username, password);

    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const value: AuthContextType = {
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
