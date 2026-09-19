// TODO: Formate date in DD/MMMM/YYYY HH:MM
export function formatDateLong(dateString) {
  // SQLite's CURRENT_TIMESTAMP has no "Z", so treat it as UTC explicitly
  const date = new Date(`${dateString.replace(" ", "T")}Z`);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// TODO: Format date in DD/MM/YYYY
export function formatDateShort(dateString) {}
