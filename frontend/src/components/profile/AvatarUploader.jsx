import { useRef, useState } from "react";
import { Camera } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageSection } from "@/components/shared/Page";
import UserAvatar from "@/components/shared/UserAvatar";

import * as usersApi from "@/api/users";

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
    <PageSection className="flex items-center gap-4">
      <div className="relative">
        <UserAvatar user={user} src={avatarUrl} className="size-20" />

        <Button
          type="button"
          size="icon"
          aria-label="Change profile photo"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute right-0 bottom-0 size-8 rounded-full border"
        >
          <Camera />
        </Button>
      </div>

      <div>
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WEBP. Max 5MB.
        </p>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileSelected}
        className="hidden"
      />
    </PageSection>
  );
}

export default AvatarUploader;
