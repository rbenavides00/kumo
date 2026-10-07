import { Fragment } from "react";
import { Home } from "lucide-react";
import type { PathItem } from "@/hooks/useFiles";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbsProps = {
  path: PathItem[];
  onNavigate: (folderId: number | null) => void;
};

function Breadcrumbs({ path, onNavigate }: BreadcrumbsProps) {
  const isRoot = path.length === 0;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isRoot ? (
            <BreadcrumbPage className="flex items-center gap-1">
              <Home className="size-3.5" />
              Home
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              render={<button type="button" onClick={() => onNavigate(null)} />}
              className="flex cursor-pointer items-center gap-1"
            >
              <Home className="size-3.5" />
              Home
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {path.map((folder, index) => {
          const isLast = index === path.length - 1;

          return (
            <Fragment key={folder.id}>
              <BreadcrumbSeparator />

              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={
                      <button
                        type="button"
                        onClick={() => onNavigate(folder.id)}
                      />
                    }
                    className="cursor-pointer"
                  >
                    {folder.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Breadcrumbs;
