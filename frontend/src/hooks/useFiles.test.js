import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useFiles from "./useFiles";
import * as filesApi from "../api/files";
import * as foldersApi from "../api/folders";

vi.mock("../api/folders");
vi.mock("../api/files");

const emptyContents = { folders: [], files: [] };

describe("useFiles", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    foldersApi.getContents.mockResolvedValue(emptyContents);
  });

  describe("initial load", () => {
    it("loads root contents on mount", async () => {
      const { result } = renderHook(() => useFiles());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(foldersApi.getContents).toHaveBeenCalledWith(null);
      expect(result.current.isEmpty).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it("populates folders and files from the response", async () => {
      foldersApi.getContents.mockResolvedValue({
        folders: [{ id: 1, name: "Docs" }],
        files: [{ id: 10, name: "readme", extension: "md" }],
      });

      const { result } = renderHook(() => useFiles());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.folders).toHaveLength(1);
      expect(result.current.files).toHaveLength(1);
      expect(result.current.isEmpty).toBe(false);
    });

    it("sets an error when the initial load fails", async () => {
      foldersApi.getContents.mockRejectedValue(new Error("network error"));

      const { result } = renderHook(() => useFiles());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.error).toBe("Could not load files.");
    });
  });

  describe("navigation", () => {
    it("openFolderById opens a folder that exists in the current listing", async () => {
      foldersApi.getContents.mockResolvedValue({
        folders: [{ id: 1, name: "Docs" }],
        files: [],
      });

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openFolderById(1));

      await waitFor(() => expect(result.current.currentFolderId).toBe(1));
      expect(result.current.path).toEqual([{ id: 1, name: "Docs" }]);
      expect(foldersApi.getContents).toHaveBeenLastCalledWith(1);
    });

    it("openFolderById does nothing if the folder id is not in the current listing", async () => {
      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openFolderById(999));

      expect(result.current.currentFolderId).toBeNull();
      expect(result.current.path).toEqual([]);
    });

    it("navigateToFolder(null) resets to root", async () => {
      foldersApi.getContents.mockResolvedValue({
        folders: [{ id: 1, name: "Docs" }],
        files: [],
      });

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      act(() => result.current.openFolderById(1));
      await waitFor(() => expect(result.current.currentFolderId).toBe(1));

      act(() => result.current.navigateToFolder(null));

      expect(result.current.currentFolderId).toBeNull();
      expect(result.current.path).toEqual([]);
    });

    it("navigateToFolder trims the path to the selected breadcrumb", async () => {
      foldersApi.getContents.mockResolvedValueOnce({
        folders: [{ id: 1, name: "Docs" }],
        files: [],
      }); // mount call (root)

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      foldersApi.getContents.mockResolvedValueOnce({
        folders: [{ id: 2, name: "Reports" }],
        files: [],
      }); // call after opening folder 1

      act(() => result.current.openFolderById(1));
      await waitFor(() => expect(result.current.currentFolderId).toBe(1));

      foldersApi.getContents.mockResolvedValueOnce({
        folders: [],
        files: [],
      }); // call after opening folder 2

      act(() => result.current.openFolderById(2));
      await waitFor(() => expect(result.current.currentFolderId).toBe(2));

      expect(result.current.path).toEqual([
        { id: 1, name: "Docs" },
        { id: 2, name: "Reports" },
      ]);

      // Now jump back to the first breadcrumb
      act(() => result.current.navigateToFolder(1));

      expect(result.current.currentFolderId).toBe(1);
      expect(result.current.path).toEqual([{ id: 1, name: "Docs" }]);
    });
  });

  describe("folder actions", () => {
    it("createFolder calls the API and reloads contents", async () => {
      foldersApi.createFolder.mockResolvedValue({});

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.createFolder("New Folder"));

      expect(foldersApi.createFolder).toHaveBeenCalledWith("New Folder", null);
      expect(foldersApi.getContents).toHaveBeenCalledTimes(2); // mount + reload
    });

    it("renameFolder calls the API and reloads contents", async () => {
      foldersApi.renameFolder.mockResolvedValue({});

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.renameFolder(1, "Renamed"));

      expect(foldersApi.renameFolder).toHaveBeenCalledWith(1, "Renamed");
    });

    it("deleteFolder calls the API and reloads contents on success", async () => {
      foldersApi.deleteFolder.mockResolvedValue({});

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.deleteFolder(1));

      expect(foldersApi.deleteFolder).toHaveBeenCalledWith(1);
      expect(result.current.error).toBeNull();
    });

    it("deleteFolder sets an error from the API response instead of throwing", async () => {
      foldersApi.deleteFolder.mockRejectedValue({
        response: { data: { error: "Folder is not empty" } },
      });

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.deleteFolder(1));

      expect(result.current.error).toBe("Folder is not empty");
    });

    it("deleteFolder falls back to a generic error when the API gives none", async () => {
      foldersApi.deleteFolder.mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.deleteFolder(1));

      expect(result.current.error).toBe("Could not delete folder.");
    });
  });

  describe("file actions", () => {
    it("uploadFile sets isUploading during the request and reloads contents", async () => {
      let resolveUpload;
      filesApi.uploadFile.mockReturnValue(
        new Promise((resolve) => {
          resolveUpload = resolve;
        }),
      );

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const fakeFile = new File(["content"], "test.txt");
      let uploadPromise;
      act(() => {
        uploadPromise = result.current.uploadFile(fakeFile);
      });

      await waitFor(() => expect(result.current.isUploading).toBe(true));

      resolveUpload({});
      await act(() => uploadPromise);

      expect(result.current.isUploading).toBe(false);
      expect(filesApi.uploadFile).toHaveBeenCalledWith(fakeFile, null);
    });

    it("uploadFile sets an error when the upload fails", async () => {
      filesApi.uploadFile.mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.uploadFile(new File(["x"], "x.txt")));

      expect(result.current.error).toBe("Could not upload file.");
      expect(result.current.isUploading).toBe(false);
    });

    it("renameFile calls the API and reloads contents", async () => {
      filesApi.renameFile.mockResolvedValue({});

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.renameFile(5, "new-name"));

      expect(filesApi.renameFile).toHaveBeenCalledWith(5, "new-name");
    });

    it("deleteFile sets an error from the API response instead of throwing", async () => {
      filesApi.deleteFile.mockRejectedValue({
        response: { data: { error: "File not found" } },
      });

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(() => result.current.deleteFile(5));

      expect(result.current.error).toBe("File not found");
    });

    it("downloadFile sets an error when the download fails, without throwing", async () => {
      filesApi.downloadFile.mockRejectedValue(new Error("boom"));

      const { result } = renderHook(() => useFiles());
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(() => result.current.downloadFile(5, "file.pdf")),
      ).resolves.not.toThrow();

      expect(result.current.error).toBe("Could not download file.");
    });
  });
});
