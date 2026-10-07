import type { CurrentUser, User } from "@kumo/shared";

import type { PublicUserRow, UserRow } from "../../db/rows.js";
import { toIsoDate } from "./date.js";

export function toPublicUser(row: PublicUserRow): User {
  return {
    id: row.id,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    hasAvatar: Boolean(row.avatar_path),
  };
}

export function toCurrentUser(row: UserRow): CurrentUser {
  return { ...toPublicUser(row), createdAt: toIsoDate(row.created_at) };
}
