const db = require("../db");

function findUserByUsername(username) {
  return db
    .prepare("SELECT id, username FROM users WHERE username = ?")
    .get(username);
}

function addShare(itemType, itemId, userId) {
  const column = itemType === "folder" ? "folder_id" : "file_id";
  return db
    .prepare(
      `INSERT INTO shares (${column}, shared_with_user_id) VALUES (?, ?)`,
    )
    .run(itemId, userId);
}

function removeShare(itemType, itemId, userId) {
  const column = itemType === "folder" ? "folder_id" : "file_id";
  return db
    .prepare(
      `DELETE FROM shares WHERE ${column} = ? AND shared_with_user_id = ?`,
    )
    .run(itemId, userId);
}

function listShares(itemType, itemId) {
  const column = itemType === "folder" ? "folder_id" : "file_id";
  return db
    .prepare(
      `
        SELECT users.id, users.username
        FROM shares
        JOIN users ON users.id = shares.shared_with_user_id
        WHERE shares.${column} = ?
      `,
    )
    .all(itemId);
}

function getShareStatus(itemType, item) {
  if (item.is_public) return "public";

  const column = itemType === "folder" ? "folder_id" : "file_id";
  const hasShares = db
    .prepare(`SELECT 1 FROM shares WHERE ${column} = ? LIMIT 1`)
    .get(item.id);

  return hasShares ? "shared" : "private";
}

module.exports = {
  findUserByUsername,
  addShare,
  removeShare,
  listShares,
  getShareStatus,
};
