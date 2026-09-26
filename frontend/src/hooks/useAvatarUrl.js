import { useEffect, useState } from "react";

import api from "../api/client";

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
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (!hasAvatar || !userId) {
      setAvatarUrl(null);
      return;
    }

    let cancelled = false;
    fetchAvatar(userId).then((url) => {
      if (!cancelled) setAvatarUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [userId, hasAvatar]);

  return avatarUrl;
}

export default useAvatarUrl;
