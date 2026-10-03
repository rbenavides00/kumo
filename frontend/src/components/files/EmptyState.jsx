import { FolderOpen } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function EmptyState() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderOpen />
        </EmptyMedia>
        <EmptyTitle>This folder is empty</EmptyTitle>
        <EmptyDescription>
          Upload a file or create a folder to get started.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export default EmptyState;
