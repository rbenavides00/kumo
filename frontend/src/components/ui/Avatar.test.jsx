import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Avatar from "./Avatar";

describe("Avatar", () => {
  it("shows initials when there is no avatarUrl", () => {
    render(<Avatar user={{ id: 1, first_name: "John", last_name: "Doe" }} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("renders the image when avatarUrl is provided", () => {
    render(<Avatar user={{ id: 1 }} avatarUrl="https://example.com/pic.jpg" />);
    expect(screen.getByAltText("Profile")).toHaveAttribute(
      "src",
      "https://example.com/pic.jpg",
    );
  });
});
