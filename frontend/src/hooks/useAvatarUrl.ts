import { useEffect, useState } from "react";

import * as usersApi from "@/api/users";

const avatarCache = new Map<number, Promise<string | null>>();

function fetchAvatar(userId: number): Promise<string | null> {
  let request = avatarCache.get(userId);

  if (!request) {
    request = usersApi
      .getAvatar(userId)
      .then((blob) => URL.createObjectURL(blob))
      .catch(() => {
        // Un fallo no se cachea: el próximo intento vuelve a pedirlo
        avatarCache.delete(userId);
        return null;
      });

    avatarCache.set(userId, request);
  }

  return request;
}

type AvatarResult = { userId: number | null; url: string | null };

function useAvatarUrl(
  userId: number | null | undefined,
  hasAvatar: boolean | undefined,
): string | null {
  const [result, setResult] = useState<AvatarResult>({
    userId: null,
    url: null,
  });

  useEffect(() => {
    if (!hasAvatar || !userId) return;

    let cancelled = false;

    fetchAvatar(userId).then((url) => {
      if (!cancelled) setResult({ userId, url });
    });

    return () => {
      cancelled = true;
    };
  }, [userId, hasAvatar]);

  return hasAvatar && userId && result.userId === userId ? result.url : null;
}

export default useAvatarUrl;
