function getNames(user) {
  return [
    (user?.first_name ?? user?.firstName ?? "").trim(),
    (user?.last_name ?? user?.lastName ?? "").trim(),
  ];
}

export function getInitials(user) {
  const [first, last] = getNames(user);

  if (first && last) return (first[0] + last[0]).toUpperCase();

  const source = first || last || user?.username || "";
  return source.slice(0, 2).toUpperCase() || "?";
}

export function getFullName(user) {
  return getNames(user).filter(Boolean).join(" ") || user?.username || "";
}
