import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Modal from "./Modal";

// Run rAF immediately in tests instead of waiting for a frame.
beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb) => {
    cb();
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});

describe("Modal", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the dialog and its children when isOpen is true", () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("calls onClose when clicking the backdrop", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );

    // The backdrop is the parent of the dialog role element
    const backdrop = screen.getByRole("dialog").parentElement;
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when clicking inside the dialog", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("dialog"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when pressing Escape", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for other keys", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("locks body scroll while open", () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when unmounted", () => {
    const { unmount } = render(
      <Modal isOpen onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  it("stays mounted during the exit transition and unmounts after transitionend on the backdrop", () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    // Still in the DOM right after isOpen flips to false (exit transition in progress)
    const backdrop = screen.getByRole("dialog").parentElement;
    expect(backdrop).toBeInTheDocument();

    // Simulate the CSS transition finishing on the backdrop itself
    fireEvent.transitionEnd(backdrop);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ignores transitionend events bubbling from inner elements", () => {
    const { rerender } = render(
      <Modal isOpen onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    // Fire transitionend on the inner dialog, not the backdrop
    fireEvent.transitionEnd(screen.getByRole("dialog"));

    // Should still be mounted, since target !== currentTarget for the backdrop listener
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not attempt to unmount when isOpen becomes true again before the transition ends", () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <Modal isOpen onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("Modal.Header", () => {
  it("renders the title and calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<Modal.Header title="My Title" onClose={onClose} />);

    expect(screen.getByText("My Title")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("Modal.Body", () => {
  it("renders children", () => {
    render(<Modal.Body>Body content</Modal.Body>);

    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("applies an extra className", () => {
    render(<Modal.Body className="extra-class">Body content</Modal.Body>);

    expect(screen.getByText("Body content")).toHaveClass("extra-class");
  });
});

describe("Modal.Footer", () => {
  it("renders children", () => {
    render(
      <Modal.Footer>
        <button type="button">Save</button>
      </Modal.Footer>,
    );

    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
