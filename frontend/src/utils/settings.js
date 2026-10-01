const SETTINGS_KEY = "kumo-settings";

export const DEFAULT_SETTINGS = {
  filesView: "list",
  filesFilter: "myFiles",
  theme: "light",
};

export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (!stored) return DEFAULT_SETTINGS;

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(stored),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      ...DEFAULT_SETTINGS,
      ...settings,
    }),
  );
}
