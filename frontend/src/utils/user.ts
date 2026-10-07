import type { User } from "@kumo/shared";

type NameSource = Pick<User, "username" | "firstName" | "lastName">;

export function getInitials(user: NameSource | null | undefined): string {
  const first = user?.firstName.trim() ?? "";
  const last = user?.lastName.trim() ?? "";

  if (first && last) return (first[0] + last[0]).toUpperCase();

  const source = first || last || user?.username || "";
  return source.slice(0, 2).toUpperCase() || "?";
}

export function getFullName(user: NameSource | null | undefined): string {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.username ||
    ""
  );
}
