import { useRef, useState } from "react";

import { Page, PageHeader } from "@/components/shared/Page";

import Breadcrumbs from "@/components/files/Breadcrumbs";
import EmptyState from "@/components/files/EmptyState";
import FilesToolbar from "@/components/files/FilesToolbar";
import FileListView from "@/components/files/FileListView";
import FileGridView from "@/components/files/FileGridView";
import FileListSkeleton from "@/components/files/skeletons/FileListSkeleton";
import FileGridSkeleton from "@/components/files/skeletons/FileGridSkeleton";
import Pagination from "@/components/files/Pagination";

import useFiles from "@/hooks/useFiles";
import usePageTitle from "@/hooks/usePageTitle";
import { getSettings } from "@/utils/settings";

function FilesPage() {
  usePageTitle("Files");
  const [viewMode, setViewMode] = useState(() => getSettings().filesView);
  const fileInputRef = useRef(null);

  const {
    // State
    filter,
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
      return viewMode === "list" ? <FileListSkeleton /> : <FileGridSkeleton />;
    }

    if (isEmpty) {
      return <EmptyState />;
    }

    if (viewMode === "list") {
      return (
        <FileListView
          filter={filter}
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
        filter={filter}
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
    <Page>
      <PageHeader
        title="Files"
        description="Everything everyone has uploaded."
      />

      <div className="space-y-3">
        <Breadcrumbs path={path} onNavigate={navigateToFolder} />

        <FilesToolbar
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          filter={filter}
          onChangeFilter={setFilter}
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
        {!isLoading && !isEmpty && (
          <Pagination
            page={page}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onChangePage={setPage}
            onChangeRowsPerPage={setRowsPerPage}
          />
        )}
      </div>
    </Page>
  );
}

export default FilesPage;
