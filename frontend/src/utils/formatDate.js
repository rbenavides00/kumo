function parseSqliteDate(dateString) {
  // SQLite's CURRENT_TIMESTAMP has no "Z", so treat it as UTC explicitly
  return new Date(`${dateString.replace(" ", "T")}Z`);
}

export function formatDateLong(dateString) {
  const date = parseSqliteDate(dateString);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(dateString) {
  const date = parseSqliteDate(dateString);

  return date.toLocaleDateString('en-UK', {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
