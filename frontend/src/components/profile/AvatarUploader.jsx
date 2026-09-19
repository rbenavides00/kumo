import { useRef, useState } from "react";
import { Camera } from "lucide-react";

import Avatar from "../ui/Avatar";
import * as usersApi from "../../api/users";

function AvatarUploader({ user, avatarUrl, onUpdated }) {
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      await usersApi.updateAvatar(file);
      await onUpdated();
    } catch (err) {
      setError(err.response?.data?.error ?? "Could not update avatar");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar user={user} avatarUrl={avatarUrl} size="md" />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-gray-900 p-1.5 text-white hover:bg-gray-800 disabled:opacity-60"
        >
          <Camera size={14} />
        </button>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700">Profile photo</p>
        <p className="text-xs text-gray-500">JPG, PNG or WEBP. Max 5MB.</p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileSelected}
        className="hidden"
      />
    </div>
  );
}

export default AvatarUploader;
