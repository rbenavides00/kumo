import { formatDistanceToNow } from "date-fns";
import type { DashboardFile } from "@kumo/shared";

import UserAvatar from "@/components/shared/UserAvatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBytes } from "@/utils/formatBytes";
import { formatFileName } from "@/utils/formatFileName";
import { getFullName } from "@/utils/user";
import { CATEGORY_META } from "@/utils/fileCategories";

type FileListCardProps = {
  title: string;
  description: string;
  files: DashboardFile[];
  emptyMessage: string;
  showOwner?: boolean;
};

function FileListCard({
  title,
  description,
  files,
  emptyMessage,
  showOwner = false,
}: FileListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {files.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="divide-y">
            {files.map((file) => {
              const { icon: Icon } = CATEGORY_META[file.category];

              return (
                <li key={file.id} className="flex items-center gap-3 py-2">
                  {showOwner && file.owner ? (
                    <UserAvatar user={file.owner} className="size-8" />
                  ) : (
                    <Icon className="size-5 shrink-0 text-muted-foreground" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {formatFileName(file.name, file.extension)}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {showOwner && file.owner
                        ? `${getFullName(file.owner)} · `
                        : ""}
                      {formatDistanceToNow(new Date(file.uploadedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default FileListCard;
