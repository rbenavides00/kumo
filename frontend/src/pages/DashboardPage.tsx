import type { DashboardData, ShareStatus } from "@kumo/shared";

import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DonutChart, { type DonutSlice } from "@/components/dashboard/DonutChart";
import FileListCard from "@/components/dashboard/FileListCard";
import { CATEGORY_META } from "@/utils/fileCategories";
import { Page, PageHeader } from "@/components/shared/Page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useDashboard } from "@/hooks/useDashboard";
import usePageTitle from "@/hooks/usePageTitle";
import { formatBytes } from "@/utils/formatBytes";
import { Button } from "@/components/ui/button";

const SHARING_META: Record<ShareStatus, { label: string; color: string }> = {
  private: { label: "Private", color: "var(--chart-1)" },
  shared: { label: "Shared with people", color: "var(--chart-2)" },
  public: { label: "Public", color: "var(--chart-3)" },
};

type LegendItem = {
  key: string;
  label: string;
  color: string;
  value: string;
};

function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="flex-1 truncate">{item.label}</span>
          <span className="text-muted-foreground">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}

function StorageCard({ storage }: { storage: DashboardData["storage"] }) {
  const { used, quota } = storage;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage</CardTitle>
        <CardDescription>
          {quota === null
            ? "No storage limit"
            : `${formatBytes(used)} of ${formatBytes(quota)} used`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {quota === null ? (
          <p className="py-8 text-center text-3xl font-semibold">
            {formatBytes(used)}
          </p>
        ) : (
          <StorageDonut used={used} quota={quota} />
        )}
      </CardContent>
    </Card>
  );
}

function StorageDonut({ used, quota }: { used: number; quota: number }) {
  const percent = Math.min(100, Math.round((used / quota) * 100));
  const usedColor = percent >= 80 ? "var(--destructive)" : "var(--chart-1)";

  return (
    <>
      <DonutChart
        slices={[
          {
            key: "used",
            label: "Used",
            value: used,
            color: usedColor,
          },
          {
            key: "free",
            label: "Free",
            value: quota - used,
            color: "var(--muted)",
          },
        ]}
        centerValue={`${percent}%`}
        centerLabel="used"
        formatValue={formatBytes}
      />

      <Legend
        items={[
          {
            key: "used",
            label: "Used space",
            color: usedColor,
            value: formatBytes(used),
          },
          {
            key: "free",
            label: "Free space",
            color: "var(--muted)",
            value: formatBytes(Math.max(0, quota - used)),
          },
        ]}
      />
    </>
  );
}

function CategoriesCard({
  categories,
}: {
  categories: DashboardData["categories"];
}) {
  const slices: DonutSlice[] = categories.map(({ category, count }) => ({
    key: category,
    label: CATEGORY_META[category].label,
    value: count,
    color: CATEGORY_META[category].color,
  }));

  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>File types</CardTitle>
        <CardDescription>Your files grouped by type.</CardDescription>
      </CardHeader>

      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No files yet.
          </p>
        ) : (
          <>
            <DonutChart
              slices={slices}
              centerValue={String(total)}
              centerLabel={total === 1 ? "file" : "files"}
            />

            <Legend
              items={categories.map(({ category, count, size }) => ({
                key: category,
                label: CATEGORY_META[category].label,
                color: CATEGORY_META[category].color,
                value: `${count} · ${formatBytes(size)}`,
              }))}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SharingCard({ sharing }: { sharing: DashboardData["sharing"] }) {
  const statuses = Object.keys(SHARING_META) as ShareStatus[];
  const total = statuses.reduce((sum, status) => sum + sharing[status], 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sharing</CardTitle>
        <CardDescription>Who can access your files.</CardDescription>
      </CardHeader>

      <CardContent>
        {total === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No files yet.
          </p>
        ) : (
          <>
            <DonutChart
              slices={statuses.map((status) => ({
                key: status,
                label: SHARING_META[status].label,
                value: sharing[status],
                color: SHARING_META[status].color,
              }))}
              centerValue={String(total)}
              centerLabel={total === 1 ? "file" : "files"}
            />

            <Legend
              items={statuses.map((status) => ({
                key: status,
                label: SHARING_META[status].label,
                color: SHARING_META[status].color,
                value: String(sharing[status]),
              }))}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  usePageTitle("Dashboard");

  const { state, retry } = useDashboard();

  return (
    <Page>
      <PageHeader
        title="Dashboard"
        description="An overview of your storage and files."
      />

      {state.status === "loading" && <DashboardSkeleton />}

      {state.status === "error" && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">{state.message}</p>
          <Button variant="outline" onClick={retry}>
            Try again
          </Button>
        </div>
      )}

      {state.status === "ready" && (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <StorageCard storage={state.data.storage} />
            <CategoriesCard categories={state.data.categories} />
            <SharingCard sharing={state.data.sharing} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <FileListCard
              title="Recent files"
              description="Your latest uploads."
              files={state.data.recentFiles}
              emptyMessage="You haven't uploaded any files yet."
            />

            <FileListCard
              title="Largest files"
              description="What takes up the most space."
              files={state.data.largestFiles}
              emptyMessage="You haven't uploaded any files yet."
            />
          </div>

          <FileListCard
            title="Shared with me"
            description="Recently shared by other users."
            files={state.data.sharedWithMe}
            emptyMessage="Nothing has been shared with you yet."
            showOwner
          />
        </div>
      )}
    </Page>
  );
}

export default DashboardPage;
