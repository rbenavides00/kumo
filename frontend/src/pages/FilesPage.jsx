import { useRef, useState } from "react";

import useFiles from "../hooks/useFiles";

import Card from "../components/ui/Card";
import Breadcrumbs from "../components/files/Breadcrumbs";
import FilesToolbar from "../components/files/FilesToolbar";
import FileListView from "../components/files/FileListView";
import FileGridView from "../components/files/FileGridView";
import EmptyState from "../components/files/EmptyState";

// TODO: Change title by NAV_ITEMS constant
// TODO: Create FilesPage component for My Files & Shared pages
function FilesPage() {
  const [viewMode, setViewMode] = useState("list");
  const fileInputRef = useRef(null);

  const {
    path,
    folders,
    files,
    isLoading,
    isUploading,
    error,
    isEmpty,

    openFolderById,
    navigateToFolder,

    createFolder,
    renameFolder,
    deleteFolder,

    renameFile,
    deleteFile,
    uploadFile,
    downloadFile,
  } = useFiles();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";

    if (!file) return;

    await uploadFile(file);
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-sm text-gray-500">Loading files...</p>;
    }

    if (isEmpty) {
      return <EmptyState />;
    }

    if (viewMode === "list") {
      return (
        <FileListView
          folders={folders}
          files={files}
          onOpenFolder={openFolderById}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
          onRenameFile={renameFile}
          onDeleteFile={deleteFile}
          onDownloadFile={downloadFile}
        />
      );
    }

    return (
      <FileGridView
        folders={folders}
        files={files}
        onOpenFolder={openFolderById}
        onRenameFolder={renameFolder}
        onDeleteFolder={deleteFolder}
        onRenameFile={renameFile}
        onDeleteFile={deleteFile}
        onDownloadFile={downloadFile}
      />
    );
  };

  return (
    <Card>
      <Card.Header title="My files" subtitle="Everything you've uploaded." />

      <Card.Body className="flex flex-col gap-4">
        <Breadcrumbs path={path} onNavigate={navigateToFolder} />

        <FilesToolbar
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onUploadClick={handleUploadClick}
          onCreateFolder={createFolder}
          isUploading={isUploading}
        />

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelected}
          className="hidden"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        {renderContent()}
      </Card.Body>
    </Card>
  );
}

export default FilesPage;
