import { describe, expect, it } from "vitest";

import { formatDateLong, formatDateShort } from "./formatDate";

describe("formatDateLong", () => {
  it("formats a SQLite timestamp with month, day, year and time", () => {
    const result = formatDateLong("2026-09-18 14:30:00");

    expect(result).toContain("2026");
    expect(result).toContain("18");
  });
});

describe("formatDateShort", () => {
  it("formats a SQLite timestamp as DD/MM/YYYY", () => {
    const result = formatDateShort("2026-09-18 14:30:00");

    expect(result).toBe("18/09/2026");
  });

  it("should give date in current timezone", () => {
    const result = formatDateShort("2026-01-05 00:00:00");

    // Tests are set in UTC
    expect(result).toBe("05/01/2026");
  });
});
