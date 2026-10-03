import { useEffect, useMemo, useState } from "react";
import { Globe, Loader2, Lock, Search, Users } from "lucide-react";

import UserAvatar from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import * as sharesApi from "@/api/shares";
import * as usersApi from "@/api/users";
import { cn } from "@/lib/utils";
import { getFullName } from "@/utils/user";

const VISIBILITY_OPTIONS = [
  {
    value: "private",
    label: "Private",
    description: "Only you can access this item.",
    icon: Lock,
  },
  {
    value: "public",
    label: "Anyone with access",
    description: "Everyone on the platform can view this item.",
    icon: Globe,
  },
  {
    value: "individual",
    label: "Shared with specific people",
    description: "Choose which users can view this item.",
    icon: Users,
  },
];

function getVisibility(isPublic, sharedWith) {
  if (isPublic) return "public";
  if (sharedWith.length > 0) return "individual";
  return "private";
}

function ShareDialog({ isOpen, onClose, itemType, itemId, itemName }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [visibility, setVisibility] = useState("private");
  const [sharedWith, setSharedWith] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Carga los ajustes actuales cada vez que se abre
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setStatus("loading");
    setSaveError(null);
    setSearch("");

    Promise.all([
      sharesApi.getShareSettings(itemType, itemId),
      usersApi.listUsers(),
    ])
      .then(([settings, userList]) => {
        if (cancelled) return;

        const currentSharedWith = settings.sharedWith.map((u) => u.id);
        setVisibility(getVisibility(settings.isPublic, currentSharedWith));
        setSharedWith(currentSharedWith);
        setUsers(userList);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, itemType, itemId]);

  // Búsqueda de usuarios con debounce
  useEffect(() => {
    if (!isOpen || visibility !== "individual") return;

    let cancelled = false;

    const timeout = setTimeout(() => {
      usersApi
        .listUsers(search)
        .then((list) => !cancelled && setUsers(list))
        .catch(() => {});
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, visibility, isOpen]);

  // Los usuarios seleccionados aparecen primero
  const sortedUsers = useMemo(
    () =>
      [...users].sort(
        (a, b) =>
          Number(sharedWith.includes(b.id)) - Number(sharedWith.includes(a.id)),
      ),
    [users, sharedWith],
  );

  const toggleUser = (userId) => {
    setSharedWith((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await sharesApi.updateShareSettings(itemType, itemId, {
        isPublic: visibility === "public",
        sharedWith: visibility === "individual" ? sharedWith : [],
      });
      onClose();
    } catch (err) {
      setSaveError(
        err.response?.data?.error ?? "Could not update sharing settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open && !isSaving) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="truncate">Share "{itemName}"</DialogTitle>
          <DialogDescription>
            Choose who can access this item.
          </DialogDescription>
        </DialogHeader>

        {status === "loading" && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading...
          </div>
        )}

        {status === "error" && (
          <p className="py-4 text-center text-sm text-destructive">
            Could not load sharing settings.
          </p>
        )}

        {status === "ready" && (
          <div className="space-y-4">
            <RadioGroup
              value={visibility}
              onValueChange={setVisibility}
              className="gap-2"
            >
              {VISIBILITY_OPTIONS.map(
                ({ value, label, description, icon: Icon }) => (
                  <FieldLabel key={value} htmlFor={`visibility-${value}`}>
                    <Field orientation="horizontal">
                      <Icon className="size-5 shrink-0 text-muted-foreground" />

                      <FieldContent>
                        <FieldTitle>{label}</FieldTitle>
                        <FieldDescription>{description}</FieldDescription>
                      </FieldContent>

                      <RadioGroupItem
                        value={value}
                        id={`visibility-${value}`}
                      />
                    </Field>
                  </FieldLabel>
                ),
              )}
            </RadioGroup>

            {visibility === "individual" && (
              <div className="space-y-2 border-t pt-4">
                <InputGroup>
                  <InputGroupAddon>
                    <Search />
                  </InputGroupAddon>
                  <InputGroupInput
                    autoFocus
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search users by username"
                    aria-label="Search users"
                  />
                </InputGroup>

                <div className="flex max-h-52 flex-col gap-1 overflow-y-auto">
                  {sortedUsers.length === 0 && (
                    <p className="py-2 text-center text-sm text-muted-foreground">
                      No users found.
                    </p>
                  )}

                  {sortedUsers.map((user) => {
                    const isChecked = sharedWith.includes(user.id);

                    return (
                      <label
                        key={user.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent",
                          isChecked && "bg-accent",
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleUser(user.id)}
                        />

                        <UserAvatar user={user} className="size-8" />

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {getFullName(user)}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            @{user.username}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || status !== "ready"}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
