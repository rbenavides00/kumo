import { useEffect, useState } from "react";

import { getSettings } from "../utils/settings";
import * as foldersApi from "../api/folders";
import * as filesApi from "../api/files";

function useFiles() {
  // State
  const [filter, setFilterState] = useState(() => getSettings().filesFilter);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [path, setPath] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [page, setPageState] = useState(1);
  const [rowsPerPage, setRowsPerPageState] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Data loading
  const loadContents = async (
    folderId,
    activeFilter = filter,
    activePage = page,
    activeRowsPerPage = rowsPerPage,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await foldersApi.getContents(
        folderId,
        activeFilter,
        activePage,
        activeRowsPerPage,
      );

      setFolders(data.folders);
      setFiles(data.files);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setError("Could not load files.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContents(currentFolderId, filter, page, rowsPerPage);
  }, [currentFolderId, filter, page, rowsPerPage]);

  const isEmpty = !isLoading && folders.length === 0 && files.length === 0;

  const setFilter = (newFilter) => {
    setPath([]);
    setCurrentFolderId(null);
    setFolders([]);
    setFiles([]);
    setPageState(1);
    setFilterState(newFilter);
  };

  const setPage = (newPage) => {
    setPageState(newPage);
  };

  const setRowsPerPage = (newRowsPerPage) => {
    setRowsPerPageState(newRowsPerPage);
    setPageState(1);
  };

  // Navigation
  const openFolder = (folder) => {
    setPath((prevPath) => [...prevPath, { id: folder.id, name: folder.name }]);
    setPageState(1);
    setCurrentFolderId(folder.id);
  };

  const openFolderById = (folderId) => {
    const folder = folders.find(({ id }) => id === folderId);
    if (folder) openFolder(folder);
  };

  const navigateToFolder = (folderId) => {
    setPageState(1);

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
    await loadContents(currentFolderId);
  };

  const renameFolder = async (folderId, name) => {
    await foldersApi.renameFolder(folderId, name);
    await loadContents(currentFolderId);
  };

  const deleteFolder = async (folderId) => {
    try {
      await foldersApi.deleteFolder(folderId);
      await loadContents(currentFolderId);
    } catch (err) {
      setError(err.response?.data?.error ?? "Could not delete folder.");
    }
  };

  // File actions
  const uploadFile = async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      await filesApi.uploadFile(file, currentFolderId);
      await loadContents(currentFolderId);
    } catch {
      setError("Could not upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const renameFile = async (fileId, name) => {
    await filesApi.renameFile(fileId, name);
    await loadContents(currentFolderId);
  };

  const deleteFile = async (fileId) => {
    try {
      await filesApi.deleteFile(fileId);
      await loadContents(currentFolderId);
    } catch (err) {
      setError(err.response?.data?.error ?? "Could not delete file.");
    }
  };

  const downloadFile = async (fileId, fileName) => {
    try {
      await filesApi.downloadFile(fileId, fileName);
    } catch (err) {
      setError(err.response?.data?.error ?? "Could not download file.");
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
