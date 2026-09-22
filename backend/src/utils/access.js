const db = require("../db");

function getFolderById(id) {
  return db.prepare("SELECT * FROM folders WHERE id = ?").get(id);
}

function getFileById(id) {
  return db.prepare("SELECT * FROM files WHERE id = ?").get(id);
}

function isSharedWithUser(itemType, itemId, userId) {
  const column = itemType === "folder" ? "folder_id" : "file_id";
  const row = db
    .prepare(
      `SELECT 1 FROM shares WHERE ${column} = ? AND shared_with_user_id = ?`,
    )
    .get(itemId, userId);
  return Boolean(row);
}

// Walks up the folder chain: a folder is readable if the user owns it, or
// if it (or any ancestor) is public or has been shared with them directly.
function getFolderAccess(folder, userId) {
  if (!folder) return { isOwner: false, canRead: false };

  if (folder.owner_id === userId) {
    return { isOwner: true, canRead: true, ownerId: folder.owner_id };
  }

  let current = folder;
  while (current) {
    if (current.is_public || isSharedWithUser("folder", current.id, userId)) {
      return { isOwner: false, canRead: true, ownerId: folder.owner_id };
    }
    current = current.parent_id ? getFolderById(current.parent_id) : null;
  }

  return { isOwner: false, canRead: false, ownerId: folder.owner_id };
}

// A file is readable if owned, public, shared directly, or if the user has
// read access to the folder that contains it (cascading from above).
function getFileAccess(file, userId) {
  if (!file) return { isOwner: false, canRead: false };

  if (file.owner_id === userId) {
    return { isOwner: true, canRead: true, ownerId: file.owner_id };
  }

  if (file.is_public || isSharedWithUser("file", file.id, userId)) {
    return { isOwner: false, canRead: true, ownerId: file.owner_id };
  }

  if (file.folder_id) {
    const folderAccess = getFolderAccess(getFolderById(file.folder_id), userId);
    if (folderAccess.canRead) {
      return { isOwner: false, canRead: true, ownerId: file.owner_id };
    }
  }

  return { isOwner: false, canRead: false, ownerId: file.owner_id };
}

module.exports = {
  getFolderById,
  getFileById,
  getFolderAccess,
  getFileAccess,
};
