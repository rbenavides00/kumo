import { useEffect, useState } from "react";

import { getSettings } from "@/utils/settings";
import * as foldersApi from "@/api/folders";
import * as filesApi from "@/api/files";

const NO_CONTENTS = { folders: [], files: [], totalPages: 1 };

function useFiles() {
  // State
  const [filter, setFilterState] = useState(() => getSettings().filesFilter);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [path, setPath] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPageState] = useState(10);
  const [reloadCount, setReloadCount] = useState(0);

  // Results, tagged with the query they belong to
  const [contents, setContents] = useState({
    key: null,
    ...NO_CONTENTS,
    error: null,
  });
  const [actionError, setActionError] = useState(null);
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
  const fail = (message) => setActionError({ key, message });

  // Navigation
  const setFilter = (newFilter) => {
    setPath([]);
    setCurrentFolderId(null);
    setPage(1);
    setFilterState(newFilter);
  };

  const setRowsPerPage = (newRowsPerPage) => {
    setRowsPerPageState(newRowsPerPage);
    setPage(1);
  };

  const openFolder = (folder) => {
    setPath((prevPath) => [...prevPath, { id: folder.id, name: folder.name }]);
    setPage(1);
    setCurrentFolderId(folder.id);
  };

  const openFolderById = (folderId) => {
    const folder = folders.find(({ id }) => id === folderId);
    if (folder) openFolder(folder);
  };

  const navigateToFolder = (folderId) => {
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
  const createFolder = async (name) => {
    await foldersApi.createFolder(name, currentFolderId);
    reload();
  };

  const renameFolder = async (folderId, name) => {
    await foldersApi.renameFolder(folderId, name);
    reload();
  };

  const deleteFolder = async (folderId) => {
    try {
      await foldersApi.deleteFolder(folderId);
      reload();
    } catch (err) {
      fail(err.response?.data?.error ?? "Could not delete folder.");
    }
  };

  // File actions
  const uploadFile = async (file) => {
    setIsUploading(true);
    setActionError(null);

    try {
      await filesApi.uploadFile(file, currentFolderId);
      reload();
    } catch {
      fail("Could not upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const renameFile = async (fileId, name) => {
    await filesApi.renameFile(fileId, name);
    reload();
  };

  const deleteFile = async (fileId) => {
    try {
      await filesApi.deleteFile(fileId);
      reload();
    } catch (err) {
      fail(err.response?.data?.error ?? "Could not delete file.");
    }
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      await filesApi.downloadFile(fileId, fileName);
    } catch (err) {
      fail(err.response?.data?.error ?? "Could not download file.");
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
