import { useEffect, useState } from "react";
import { FolderOpen, LayoutGrid, List, Moon, Sun, Users } from "lucide-react";
import { Page, PageHeader, PageSection } from "@/components/shared/Page";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import usePageTitle from "@/hooks/usePageTitle";
import { getSettings, saveSettings } from "@/utils/settings";

function SettingsPage() {
  usePageTitle("Settings");

  const [settings, setSettings] = useState(getSettings);

  useEffect(() => {
    saveSettings(settings);

    const isDark = settings.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [settings]);

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

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
          value={settings.filesView}
          onValueChange={(value) => updateSetting("filesView", value)}
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
          value={settings.filesFilter}
          onValueChange={(value) => updateSetting("filesFilter", value)}
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
          value={settings.theme}
          onValueChange={(value) => updateSetting("theme", value)}
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
          </TabsList>
        </Tabs>
      </PageSection>
    </Page>
  );
}

export default SettingsPage;
