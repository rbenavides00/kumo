import { useRef, useState, type ChangeEvent } from "react";
import { Camera, Loader2 } from "lucide-react";

import type { CurrentUser } from "@kumo/shared";

import { Button } from "@/components/ui/button";
import { PageSection } from "@/components/shared/Page";
import UserAvatar from "@/components/shared/UserAvatar";

import { cn } from "@/lib/utils";
import * as usersApi from "@/api/users";
import { notify } from "@/utils/notify";

type AvatarUploaderProps = {
  user: CurrentUser;
  avatarUrl: string | null;
  onUpdated: (user: CurrentUser) => void;
};

function AvatarUploader({ user, avatarUrl, onUpdated }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);

    try {
      const updatedUser = await usersApi.updateAvatar(file);
      onUpdated(updatedUser);

      notify.success("Avatar updated successfully.");
    } catch (err: unknown) {
      notify.error(err, "Could not update avatar.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageSection className="flex items-center gap-4">
      <Button
        type="button"
        variant="ghost"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        aria-label="Change profile photo"
        aria-busy={isUploading}
        className="group relative size-20 rounded-full p-0 hover:bg-transparent disabled:opacity-100"
      >
        <UserAvatar user={user} src={avatarUrl} className="size-20" />

        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white transition-opacity",
            isUploading
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
          )}
        >
          {isUploading ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Camera className="size-6" />
          )}
        </span>
      </Button>

      <div>
        <p className="text-sm font-medium">Profile photo</p>
        <p className="text-xs text-muted-foreground">
          Click the avatar to upload a new photo
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WEBP. Max 5MB.
        </p>
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
