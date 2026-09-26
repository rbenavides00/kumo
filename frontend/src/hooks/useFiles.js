import { useEffect, useState } from "react";
import * as foldersApi from "../api/folders";
import * as filesApi from "../api/files";

function useFiles() {
  // State
  const [filter, setFilterState] = useState("myFiles");
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [path, setPath] = useState([]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Data loading
  const loadContents = async (folderId, activeFilter = filter) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await foldersApi.getContents(folderId, activeFilter);

      setFolders(data.folders);
      setFiles(data.files);
    } catch {
      setError("Could not load files.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContents(currentFolderId, filter);
  }, [currentFolderId, filter]);

  const isEmpty = !isLoading && folders.length === 0 && files.length === 0;

  const setFilter = (newFilter) => {
    setPath([]);
    setCurrentFolderId(null);
    setFolders([]);
    setFiles([]);
    setFilterState(newFilter);
  };

  // Navigation
  const openFolder = (folder) => {
    setPath((prevPath) => [...prevPath, { id: folder.id, name: folder.name }]);

    setCurrentFolderId(folder.id);
  };

  const openFolderById = (folderId) => {
    const folder = folders.find(({ id }) => id === folderId);

    if (folder) {
      openFolder(folder);
    }
  };

  const navigateToFolder = (folderId) => {
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
    isLoading,
    isUploading,
    error,
    isEmpty,

    // Navigation
    setFilter,
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
