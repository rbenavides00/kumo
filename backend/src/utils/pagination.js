const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function parsePagination(query) {
  const page = Number.parseInt(query.page, 10) || 1;
  const pageSize = Number.parseInt(query.pageSize, 10) || DEFAULT_PAGE_SIZE;

  if (page < 1 || pageSize < 1) {
    return { error: "Invalid pagination parameters." };
  }

  if (pageSize > MAX_PAGE_SIZE) {
    return {
      error: `Page size cannot exceed ${MAX_PAGE_SIZE}.`,
    };
  }

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

// Splits a single [offset, limit) window across two lists shown back-to-back
// (folders first, then files), without needing a SQL UNION between two
// differently-shaped tables.
function splitOffsetAcrossLists(offset, limit, firstListCount) {
  const firstOffset = Math.min(offset, firstListCount);
  const firstLimit = Math.max(0, Math.min(limit, firstListCount - firstOffset));

  const remaining = limit - firstLimit;
  const secondOffset = Math.max(0, offset - firstListCount);
  const secondLimit = remaining;

  return {
    folders: { offset: firstOffset, limit: firstLimit },
    files: { offset: secondOffset, limit: secondLimit },
  };
}

module.exports = { DEFAULT_PAGE_SIZE, parsePagination, splitOffsetAcrossLists };
