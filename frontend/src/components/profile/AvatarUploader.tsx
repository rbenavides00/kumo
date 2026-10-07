import { useRef, useState, type ChangeEvent } from "react";
import { Camera } from "lucide-react";

import type { CurrentUser } from "@kumo/shared";

import { Button } from "@/components/ui/button";
import { PageSection } from "@/components/shared/Page";
import UserAvatar from "@/components/shared/UserAvatar";

import * as usersApi from "@/api/users";
import { getErrorMessage } from "@/api/errors";

type AvatarUploaderProps = {
  user: CurrentUser;
  avatarUrl: string | null;
  onUpdated: (user: CurrentUser) => void;
};

function AvatarUploader({ user, avatarUrl, onUpdated }: AvatarUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const updatedUser = await usersApi.updateAvatar(file);
      onUpdated(updatedUser);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not update avatar"));
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
