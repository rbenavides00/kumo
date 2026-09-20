import { describe, expect, it } from "vitest";

import { getAvatarColor, getInitials } from "./getInitialsAvatar";

describe("getInitials", () => {
  it("returns the first letter of first and last name, uppercased", () => {
    expect(getInitials("john", "doe")).toBe("JD");
  });

  it("returns just the first initial when there is no last name", () => {
    expect(getInitials("John", undefined)).toBe("J");
  });

  it("returns just the last initial when there is no first name", () => {
    expect(getInitials(undefined, "Doe")).toBe("D");
  });

  it("falls back to ? when neither name is provided", () => {
    expect(getInitials(undefined, undefined)).toBe("?");
  });

  it("falls back to ? when both names are empty strings", () => {
    expect(getInitials("", "")).toBe("?");
  });

  it("trims whitespace before taking the initial", () => {
    expect(getInitials("  John", "Doe  ")).toBe("JD");
  });
});

// TODO: Update tests once UUIDs are implemented
describe("getAvatarColor", () => {
  it("returns a color class string", () => {
    expect(getAvatarColor(0)).toMatch(/^bg-\w+-500$/);
  });

  it("wraps around when id exceeds the color list length", () => {
    expect(getAvatarColor(9)).toBe(getAvatarColor(0));
  });
});
