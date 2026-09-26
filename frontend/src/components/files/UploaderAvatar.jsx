import Avatar from "../ui/Avatar";
import useAvatarUrl from "../../hooks/useAvatarUrl";

function UploaderAvatar({ owner, size = "sm" }) {
  const avatarUrl = useAvatarUrl(owner.id, owner.hasAvatar);
  const fullName =
    [owner.firstName, owner.lastName].filter(Boolean).join(" ") ||
    owner.username;

  return (
    <div className="group/avatar relative inline-flex">
      <Avatar
        user={{
          id: owner.id,
          first_name: owner.firstName,
          last_name: owner.lastName,
        }}
        avatarUrl={avatarUrl}
        size={size}
      />

      <div className="pointer-events-none absolute top-full left-1/2 z-30 mt-1 -translate-x-1/2 rounded-lg bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover/avatar:opacity-100">
        <p className="font-medium">{fullName}</p>
        <p className="text-gray-300">@{owner.username}</p>
      </div>
    </div>
  );
}

export default UploaderAvatar;
