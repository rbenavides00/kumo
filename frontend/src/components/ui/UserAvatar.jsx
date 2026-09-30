import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import Avatar from "./Avatar";
import useAvatarUrl from "../../hooks/useAvatarUrl";

function UserAvatar({ user, size = "sm", showDetails = false }) {
  const avatarUrl = useAvatarUrl(user.id, user.hasAvatar);
  const [position, setPosition] = useState(null);
  const avatarRef = useRef(null);

  if (!showDetails) {
    return <Avatar user={user} avatarUrl={avatarUrl} size={size} />;
  }

  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;

  const showTooltip = () => {
    const rect = avatarRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  };

  const hideTooltip = () => setPosition(null);

  // Closes the tooltip on scroll
  useEffect(() => {
    if (!position) return;

    window.addEventListener("scroll", hideTooltip, true);
    window.addEventListener("resize", hideTooltip);

    return () => {
      window.removeEventListener("scroll", hideTooltip, true);
      window.removeEventListener("resize", hideTooltip);
    };
  }, [position]);

  return (
    <>
      <span
        ref={avatarRef}
        className="inline-flex"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        <Avatar user={user} avatarUrl={avatarUrl} size={size} />
      </span>

      {position &&
        createPortal(
          <div
            style={{ top: position.top, left: position.left, transform: "translateX(-50%)" }}
            className="pointer-events-none fixed z-50 max-w-60 rounded-lg bg-gray-900 px-2 py-1 text-center text-xs whitespace-nowrap text-white shadow-lg"
          >
            <p className="font-medium">{fullName}</p>
            <p className="text-gray-300">@{user.username}</p>
          </div>,
          document.body,
        )}
    </>
  );
}

export default UserAvatar;