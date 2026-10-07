import {
  FolderOpen,
  LayoutGrid,
  List,
  Monitor,
  Moon,
  Sun,
  Users,
} from "lucide-react";

import { Page, PageHeader, PageSection } from "@/components/shared/Page";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/components/theme-provider";

import usePageTitle from "@/hooks/usePageTitle";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FILES_FILTER, FILES_VIEW } from "@/utils/preferences";

function SettingsPage() {
  usePageTitle("Settings");

  const { theme, setTheme } = useTheme();
  const [filesView, setFilesView] = useLocalStorage(FILES_VIEW);
  const [filesFilter, setFilesFilter] = useLocalStorage(FILES_FILTER);

  return (
    <Page>
      <PageHeader
        title="Settings"
        description="Manage your application preferences."
      />

      <PageSection
        title="Default Files view"
        description="Choose how your files are displayed by default."
      >
        <Tabs
          value={filesView}
          onValueChange={(value) => setFilesView(value as typeof filesView)}
        >
          <TabsList>
            <TabsTrigger value="list">
              <List />
              List
            </TabsTrigger>

            <TabsTrigger value="grid">
              <LayoutGrid />
              Grid
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </PageSection>

      <PageSection
        title="Default Files filter"
        description="Choose which files are shown when opening the Files page."
      >
        <Tabs
          value={filesFilter}
          onValueChange={(value) => setFilesFilter(value as typeof filesFilter)}
        >
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
      </PageSection>

      <PageSection
        title="Theme"
        description="Choose the appearance of the application."
      >
        <Tabs
          value={theme}
          onValueChange={(value) => setTheme(value as typeof theme)}
        >
          <TabsList>
            <TabsTrigger value="light">
              <Sun />
              Light
            </TabsTrigger>

            <TabsTrigger value="dark">
              <Moon />
              Dark
            </TabsTrigger>

            <TabsTrigger value="system">
              <Monitor />
              System
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </PageSection>
    </Page>
  );
}

export default SettingsPage;
