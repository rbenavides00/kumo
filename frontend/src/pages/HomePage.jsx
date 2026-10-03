import { Page, PageHeader } from "@/components/shared/Page";

import usePageTitle from "@/hooks/usePageTitle";

function HomePage() {
  usePageTitle("Home");

  return (
    <Page>
      <PageHeader
        title="Welcome back"
        description="Manage your files and projects."
      />

      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <h2 className="text-lg font-medium">Main content</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your content goes here.
        </p>
      </div>
    </Page>
  );
}

export default HomePage;
