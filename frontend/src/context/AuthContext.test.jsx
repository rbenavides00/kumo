import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "./AuthContext";
import * as authApi from "../api/auth";

vi.mock("../api/auth");

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it("throws when useAuth is used outside an AuthProvider", () => {
    // Suppress the expected React error log for this negative test
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider",
    );

    consoleError.mockRestore();
  });

  it("initializes isAuthenticated as false when there is no stored token", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("initializes isAuthenticated as true when a token already exists in localStorage", () => {
    localStorage.setItem("token", "existing-token");

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.token).toBe("existing-token");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("login stores the token and updates isAuthenticated", async () => {
    authApi.login.mockResolvedValue({ token: "new-token" });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(() => result.current.login("alice", "password123"));

    expect(authApi.login).toHaveBeenCalledWith("alice", "password123");
    expect(result.current.token).toBe("new-token");
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem("token")).toBe("new-token");
  });

  it("login propagates errors and does not change the token", async () => {
    authApi.login.mockRejectedValue(new Error("invalid credentials"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(() => result.current.login("alice", "wrong")),
    ).rejects.toThrow("invalid credentials");

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("logout clears the token", () => {
    localStorage.setItem("token", "existing-token");

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => result.current.logout());

    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("clears the token when an auth:unauthorized event is dispatched", async () => {
    localStorage.setItem("token", "existing-token");

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      window.dispatchEvent(new Event("auth:unauthorized"));
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
  });

  it("removes the auth:unauthorized listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useAuth(), { wrapper });
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "auth:unauthorized",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
