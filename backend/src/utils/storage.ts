import db from "../db/database.js";

export function getUsedStorage(userId: number): number {
  const row = db
    .prepare(
      "SELECT COALESCE(SUM(size), 0) AS used FROM files WHERE owner_id = ?",
    )
    .get(userId) as { used: number };

  return row.used;
}
