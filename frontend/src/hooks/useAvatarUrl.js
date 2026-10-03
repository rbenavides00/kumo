import { useEffect, useState } from "react";

import api from "@/api/client";

const avatarCache = new Map();

function fetchAvatar(userId) {
  if (!avatarCache.has(userId)) {
    avatarCache.set(
      userId,
      api
        .get(`/users/${userId}/avatar`, { responseType: "blob" })
        .then((res) => URL.createObjectURL(res.data))
        .catch(() => null),
    );
  }
  return avatarCache.get(userId);
}

function useAvatarUrl(userId, hasAvatar) {
  const [result, setResult] = useState({ userId: null, url: null });
  const shouldFetch = Boolean(hasAvatar && userId);

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;

    fetchAvatar(userId).then((url) => {
      if (!cancelled) setResult({ userId, url });
    });

    return () => {
      cancelled = true;
    };
  }, [userId, shouldFetch]);

  return shouldFetch && result.userId === userId ? result.url : null;
}

export default useAvatarUrl;
