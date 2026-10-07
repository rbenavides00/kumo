import type { ComponentProps } from "react";
import type { User } from "@kumo/shared";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import useAvatarUrl from "@/hooks/useAvatarUrl";
import { cn } from "@/lib/utils";
import { getFullName, getInitials } from "@/utils/user";

type UserAvatarProps = Omit<ComponentProps<typeof Avatar>, "children"> & {
  user: User | null;
  src?: string | null;
  showDetails?: boolean;
};

function UserAvatar({
  user,
  src,
  showDetails = false,
  className,
  ...props
}: UserAvatarProps) {
  const fetchedUrl = useAvatarUrl(src ? null : user?.id, user?.hasAvatar);
  const imageUrl = src ?? fetchedUrl;

  const avatar = (
    <Avatar className={cn("@container", className)} {...props}>
      {imageUrl && <AvatarImage src={imageUrl} alt={user?.username ?? ""} />}
      <AvatarFallback className="text-[40cqw]">
        {getInitials(user)}
      </AvatarFallback>
    </Avatar>
  );

  if (!showDetails || !user) return avatar;

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help">{avatar}</TooltipTrigger>

      <TooltipContent className="flex flex-col">
        <p className="font-medium">{getFullName(user)}</p>
        <p className="opacity-70">@{user.username}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default UserAvatar;
