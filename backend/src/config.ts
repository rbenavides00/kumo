function parseQuota(value: string | undefined): number | null {
  if (!value?.trim()) return null;

  const gb = Number(value);

  if (!Number.isFinite(gb) || gb <= 0) {
    throw new Error(`Invalid STORAGE_QUOTA_GB: "${value}"`);
  }

  return Math.floor(gb * 1024 ** 3);
}

// Bytes allowed per user, or null when unlimited.
export const STORAGE_QUOTA_BYTES = parseQuota(process.env.STORAGE_QUOTA_GB);
