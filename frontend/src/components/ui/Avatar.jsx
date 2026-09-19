import { getAvatarColor, getInitials } from "../../utils/getInitialsAvatar";

const SIZES = {
  sm: { box: "h-10 w-10", text: "text-sm" },
  md: { box: "h-20 w-20", text: "text-3xl" }
};

function Avatar({ user, avatarUrl, size = "md" }) {
  const { box, text } = SIZES[size] ?? SIZES.md;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="Profile"
        className={`${box} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${box} ${text} flex items-center justify-center rounded-full font-medium text-white ${getAvatarColor(user?.id ?? 0)}`}
    >
      {getInitials(user?.first_name, user?.last_name)}
    </div>
  );
}

export default Avatar;