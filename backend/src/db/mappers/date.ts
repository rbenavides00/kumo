// SQLite's CURRENT_TIMESTAMP has no "Z", so treat it as UTC explicitly
export function toIsoDate(value: string): string {
  return new Date(`${value.replace(" ", "T")}Z`).toISOString();
}
