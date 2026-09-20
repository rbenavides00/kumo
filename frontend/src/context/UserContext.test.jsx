import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserProvider, useUser } from "./UserContext";
import { AuthProvider } from "./AuthContext";
import * as usersApi from "../api/users";
import api from "../api/client";

vi.mock("../api/users");
vi.mock("../api/client");

function wrapper({ children }) {
  return (
    <AuthProvider>
      <UserProvider>{children}</UserProvider>
    </AuthProvider>
  );
}

describe("UserContext", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();

    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("throws when useUser is used outside a UserProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within a UserProvider",
    );

    consoleError.mockRestore();
  });

  it("does not load a user when there is no authenticated session", async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.avatarUrl).toBeNull();
    expect(usersApi.getProfile).not.toHaveBeenCalled();
  });

  it("loads the user profile when authenticated, without an avatar", async () => {
    localStorage.setItem("token", "existing-token");
    usersApi.getProfile.mockResolvedValue({
      first_name: "Ana",
      last_name: "López",
      avatar_path: null,
    });

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() =>
      expect(result.current.user).toEqual({
        first_name: "Ana",
        last_name: "López",
        avatar_path: null,
      }),
    );
    expect(result.current.avatarUrl).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("loads the avatar blob when the profile has one", async () => {
    localStorage.setItem("token", "existing-token");
    usersApi.getProfile.mockResolvedValue({
      first_name: "Ana",
      avatar_path: "/storage/avatars/1.png",
    });
    api.get.mockResolvedValue({ data: new Blob(["fake-image"]) });

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => expect(result.current.avatarUrl).toBe("blob:mock-url"));
    expect(api.get).toHaveBeenCalledWith("/users/me/avatar", {
      responseType: "blob",
    });
  });

  it("falls back to no avatar if fetching the avatar blob fails", async () => {
    localStorage.setItem("token", "existing-token");
    usersApi.getProfile.mockResolvedValue({
      first_name: "Ana",
      avatar_path: "/storage/avatars/1.png",
    });
    api.get.mockRejectedValue(new Error("network error"));

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => expect(result.current.user).not.toBeNull());
    expect(result.current.avatarUrl).toBeNull();
  });

  it("clears the user and avatar when the session becomes unauthenticated", async () => {
    localStorage.setItem("token", "existing-token");
    usersApi.getProfile.mockResolvedValue({
      first_name: "Ana",
      avatar_path: "/storage/avatars/1.png",
    });
    api.get.mockResolvedValue({ data: new Blob(["fake-image"]) });

    const { result } = renderHook(() => ({ user: useUser(), auth: null }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.user.user).not.toBeNull());

    act(() => {
      window.dispatchEvent(new Event("auth:unauthorized"));
    });

    await waitFor(() => expect(result.current.user.user).toBeNull());
    expect(result.current.user.avatarUrl).toBeNull();
  });

  it("refreshUser re-fetches the profile and returns it", async () => {
    localStorage.setItem("token", "existing-token");
    usersApi.getProfile
      .mockResolvedValueOnce({ first_name: "Ana", avatar_path: null })
      .mockResolvedValueOnce({ first_name: "Ana Updated", avatar_path: null });

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => expect(result.current.user.first_name).toBe("Ana"));

    let returnedProfile;
    await act(async () => {
      returnedProfile = await result.current.refreshUser();
    });

    expect(returnedProfile.first_name).toBe("Ana Updated");
    expect(result.current.user.first_name).toBe("Ana Updated");
  });

  it("revokes the previous avatar object URL when refreshing to a new one", async () => {
    localStorage.setItem("token", "existing-token");
    usersApi.getProfile.mockResolvedValue({
      first_name: "Ana",
      avatar_path: "/storage/avatars/1.png",
    });
    api.get.mockResolvedValue({ data: new Blob(["fake-image"]) });

    const { result } = renderHook(() => useUser(), { wrapper });

    await waitFor(() => expect(result.current.avatarUrl).toBe("blob:mock-url"));

    await act(() => result.current.refreshUser());

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });
});
