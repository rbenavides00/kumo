import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import usePageTitle from "../hooks/usePageTitle";
import { getSettings, saveSettings } from "../utils/settings";

function SettingsPage() {
  usePageTitle("Settings");

  const [settings, setSettings] = useState(getSettings);

  useEffect(() => {
    saveSettings(settings);

    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark",
    );
  }, [settings]);

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  return (
    <Card>
      <Card.Header
        title="Settings"
        subtitle="Manage your application preferences."
      />

      <Card.Body className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Default Files view
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Choose how your files are displayed by default.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => updateSetting("filesView", "list")}
              className={`rounded-md border px-4 py-2 text-sm cursor-pointer ${
                settings.filesView === "list"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              List
            </button>

            <button
              type="button"
              onClick={() => updateSetting("filesView", "grid")}
              className={`rounded-md border px-4 py-2 text-sm cursor-pointer ${
                settings.filesView === "grid"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Grid
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900">
            Default Files filter
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Choose which files are shown when opening the Files page.
          </p>

          <select
            value={settings.filesFilter}
            onChange={(event) =>
              updateSetting("filesFilter", event.target.value)
            }
            className="mt-3 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
          >
            <option value="myFiles">My Files</option>
            <option value="sharedWithMe">Shared with Me</option>
          </select>
        </div>

        {/* <div>
          <h3 className="text-sm font-medium text-gray-900">Theme</h3>

          <p className="mt-1 text-sm text-gray-500">
            Choose the appearance of the application.
          </p>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => updateSetting("theme", "light")}
              className={`rounded-md border px-4 py-2 text-sm cursor-pointer ${
                settings.theme === "light"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Light
            </button>

            <button
              type="button"
              onClick={() => updateSetting("theme", "dark")}
              className={`rounded-md border px-4 py-2 text-sm cursor-pointer ${
                settings.theme === "dark"
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Dark
            </button>
          </div>
        </div> */}
      </Card.Body>
    </Card>
  );
}

export default SettingsPage;
