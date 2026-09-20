import { describe, expect, it } from "vitest";

import { formatFileName } from "./formatFileName";

describe("formatFileName", () => {
  it("joins name and extension with a dot", () => {
    expect(formatFileName("myFile", "pdf")).toBe("myFile.pdf");
  });

  it("returns only the name when extension is empty", () => {
    expect(formatFileName("README", "")).toBe("README");
  });

  it("returns only the name when extension is undefined", () => {
    expect(formatFileName("README", undefined)).toBe("README");
  });

  it("returns only the name when extension is null", () => {
    expect(formatFileName("README", null)).toBe("README");
  });
});
