import { useState } from "react";
import {
  FolderOpen,
  FolderPlus,
  LayoutGrid,
  List,
  Loader2,
  Upload,
  Users,
} from "lucide-react";

import PromptDialog from "@/components/shared/PromptDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function FilesToolbar({
  viewMode,
  onChangeViewMode,
  filter,
  onChangeFilter,
  onUploadClick,
  onCreateFolder,
  isUploading,
}) {
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs value={filter} onValueChange={onChangeFilter}>
        <TabsList>
          <TabsTrigger value="myFiles">
            <FolderOpen />
            My files
          </TabsTrigger>
          <TabsTrigger value="sharedWithMe">
            <Users />
            Shared with me
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs
        value={viewMode}
        onValueChange={onChangeViewMode}
        className="sm:order-3 sm:ml-auto"
      >
        <TabsList>
          <TabsTrigger value="list" aria-label="List view">
            <List />
          </TabsTrigger>
          <TabsTrigger value="grid" aria-label="Grid view">
            <LayoutGrid />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filter === "myFiles" && (
        <div className="flex w-full items-center gap-2 sm:order-2 sm:w-auto">
          <Button onClick={onUploadClick} disabled={isUploading}>
            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
            {isUploading ? "Uploading..." : "Upload file"}
          </Button>

          <Button
            variant="outline"
            onClick={() => setIsNewFolderModalOpen(true)}
          >
            <FolderPlus />
            New folder
          </Button>
        </div>
      )}

      <PromptDialog
        isOpen={isNewFolderModalOpen}
        onClose={() => setIsNewFolderModalOpen(false)}
        onSubmit={onCreateFolder}
        title="New folder"
        placeholder="Folder name"
        submitLabel="Create"
        validate={(value) => (!value ? "Folder name is required" : null)}
      />
    </div>
  );
}

export default FilesToolbar;
