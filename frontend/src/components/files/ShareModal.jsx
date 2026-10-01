import { useEffect, useMemo, useState } from "react";
import { Check, Globe, Lock, Users } from "lucide-react";

import Modal from "../ui/Modal";
import UserAvatar from "../ui/UserAvatar";
import * as sharesApi from "../../api/shares";
import * as usersApi from "../../api/users";

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

function ShareModal({ isOpen, onClose, itemType, itemId, itemName }) {
  const [visibility, setVisibility] = useState("private");
  const [sharedWith, setSharedWith] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      sharesApi.getShareSettings(itemType, itemId),
      usersApi.listUsers(),
    ])
      .then(([settings, userList]) => {
        const currentSharedWith = settings.sharedWith.map((u) => u.id);
        setVisibility(getVisibility(settings.isPublic, currentSharedWith));
        setSharedWith(currentSharedWith);
        setUsers(userList);
      })
      .catch(() => setError("Could not load sharing settings."))
      .finally(() => setIsLoading(false));
  }, [isOpen, itemType, itemId]);

  useEffect(() => {
    if (!isOpen || visibility !== "individual") return;

    const timeout = setTimeout(() => {
      usersApi.listUsers(search).then(setUsers);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, visibility, isOpen]);

  const toggleUser = (userId) => {
    setSharedWith((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await sharesApi.updateShareSettings(itemType, itemId, {
        isPublic: visibility === "public",
        sharedWith: visibility === "individual" ? sharedWith : [],
      });
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ?? "Could not update sharing settings.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aSelected = sharedWith.includes(a.id);
      const bSelected = sharedWith.includes(b.id);

      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    });
  }, [users, sharedWith]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header title={`Share "${itemName}"`} onClose={onClose} />

      <Modal.Body className="flex flex-col gap-4">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = visibility === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVisibility(option.value)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={18} className="shrink-0 text-gray-500" />

                    <span className="flex-1">
                      <span className="block text-sm font-medium text-gray-800">
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {option.description}
                      </span>
                    </span>

                    {isSelected && (
                      <Check size={16} className="shrink-0 text-gray-900" />
                    )}
                  </button>
                );
              })}
            </div>

            {visibility === "individual" && (
              <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by username"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                />

                <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
                  {users.length === 0 && (
                    <p className="py-2 text-center text-sm text-gray-400">
                      No users found.
                    </p>
                  )}

                  {sortedUsers.map((user) => {
                    const isChecked = sharedWith.includes(user.id);
                    const fullName =
                      [user.firstName, user.lastName]
                        .filter(Boolean)
                        .join(" ") || user.username;

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => toggleUser(user.id)}
                        className={`flex items-center gap-2 rounded-lg p-2 text-left transition-colors cursor-pointer ${
                          isChecked ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      >
                        <UserAvatar user={user} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-gray-800">
                            {fullName}
                          </span>
                          <span className="block truncate text-xs text-gray-500">
                            @{user.username}
                          </span>
                        </span>
                        {isChecked && (
                          <Check size={16} className="shrink-0 text-gray-900" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-60 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 cursor-pointer"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ShareModal;
