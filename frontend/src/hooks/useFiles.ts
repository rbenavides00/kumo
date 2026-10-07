import { useEffect, useState } from "react";
import type { ContentFilter, FileItem, FolderItem } from "@kumo/shared";

import * as filesApi from "@/api/files";
import * as foldersApi from "@/api/folders";
import { getErrorMessage } from "@/api/errors";
import { readPreference } from "@/hooks/useLocalStorage";
import { FILES_FILTER } from "@/utils/preferences";

export type PathItem = Pick<FolderItem, "id" | "name">;

type Contents = {
  key: string | null;
  folders: FolderItem[];
  files: FileItem[];
  totalPages: number;
  error: string | null;
};

const NO_CONTENTS: Pick<Contents, "folders" | "files" | "totalPages"> = {
  folders: [],
  files: [],
  totalPages: 1,
};

function useFiles() {
  // Query state
  const [filter, setFilterState] = useState<ContentFilter>(() =>
    readPreference(FILES_FILTER),
  );
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [path, setPath] = useState<PathItem[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPageState] = useState(10);
  const [reloadCount, setReloadCount] = useState(0);

  // Results, tagged with the query they belong to
  const [contents, setContents] = useState<Contents>({
    key: null,
    ...NO_CONTENTS,
    error: null,
  });
  const [actionError, setActionError] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Derived state
  const key = `${currentFolderId}|${filter}|${page}|${rowsPerPage}`;
  const isLoading = contents.key !== key;
  const { folders, files, totalPages } = contents;

  // Action errors only show for the query where they happened
  const loadError = isLoading ? null : contents.error;
  const error = actionError?.key === key ? actionError.message : loadError;

  const isEmpty = !isLoading && folders.length === 0 && files.length === 0;

  // Data loading
  useEffect(() => {
    let cancelled = false;

    foldersApi
      .getContents(currentFolderId, filter, page, rowsPerPage)
      .then((data) => {
        if (cancelled) return;
        setContents({
          key,
          folders: data.folders,
          files: data.files,
          totalPages: data.pagination.totalPages,
          error: null,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setContents({ key, ...NO_CONTENTS, error: "Could not load files." });
      });

    return () => {
      cancelled = true;
    };
  }, [key, currentFolderId, filter, page, rowsPerPage, reloadCount]);

  const reload = () => setReloadCount((count) => count + 1);
  const fail = (message: string) => setActionError({ key, message });

  // Navigation
  const setFilter = (newFilter: ContentFilter) => {
    setPath([]);
    setCurrentFolderId(null);
    setPage(1);
    setFilterState(newFilter);
  };

  const setRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPageState(newRowsPerPage);
    setPage(1);
  };

  const openFolder = (folder: FolderItem) => {
    setPath((prevPath) => [...prevPath, { id: folder.id, name: folder.name }]);
    setPage(1);
    setCurrentFolderId(folder.id);
  };

  const openFolderById = (folderId: number) => {
    const folder = folders.find(({ id }) => id === folderId);
    if (folder) openFolder(folder);
  };

  const navigateToFolder = (folderId: number | null) => {
    setPage(1);

    if (folderId === null) {
      setPath([]);
      setCurrentFolderId(null);
      return;
    }

    const folderIndex = path.findIndex(({ id }) => id === folderId);

    setPath(path.slice(0, folderIndex + 1));
    setCurrentFolderId(folderId);
  };

  // Folder actions
  const createFolder = async (name: string) => {
    await foldersApi.createFolder(name, currentFolderId);
    reload();
  };

  const renameFolder = async (folderId: number, name: string) => {
    await foldersApi.renameFolder(folderId, name);
    reload();
  };

  const deleteFolder = async (folderId: number) => {
    try {
      await foldersApi.deleteFolder(folderId);
      reload();
    } catch (err) {
      fail(getErrorMessage(err, "Could not delete folder."));
    }
  };

  // File actions
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setActionError(null);

    try {
      await filesApi.uploadFile(file, currentFolderId);
      reload();
    } catch (err: unknown) {
      fail(getErrorMessage(err, "Could not upload file."));
    } finally {
      setIsUploading(false);
    }
  };

  const renameFile = async (fileId: number, name: string) => {
    await filesApi.renameFile(fileId, name);
    reload();
  };

  const deleteFile = async (fileId: number) => {
    try {
      await filesApi.deleteFile(fileId);
      reload();
    } catch (err) {
      fail(getErrorMessage(err, "Could not delete file."));
    }
  };

  const downloadFile = async (fileId: number, fileName: string) => {
    try {
      await filesApi.downloadFile(fileId, fileName);
    } catch (err) {
      fail(getErrorMessage(err, "Could not download file."));
    }
  };

  return {
    // State
    filter,
    currentFolderId,
    path,
    folders,
    files,
    page,
    rowsPerPage,
    totalPages,
    isLoading,
    isUploading,
    error,
    isEmpty,

    // Navigation
    setFilter,
    setPage,
    setRowsPerPage,
    openFolderById,
    navigateToFolder,

    // Folder actions
    createFolder,
    renameFolder,
    deleteFolder,

    // File actions
    uploadFile,
    renameFile,
    deleteFile,
    downloadFile,
  };
}

export default useFiles;
