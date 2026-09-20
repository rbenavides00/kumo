import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PromptModal from "./PromptModal";

// Run rAF immediately in tests instead of waiting for a frame.
beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb) => {
    cb();
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

function renderPromptModal(props = {}) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    title: "New folder",
    label: "Folder name",
    placeholder: "Folder name",
    submitLabel: "Create",
    validate: (value) => (!value ? "Name is required" : null),
  };

  return render(<PromptModal {...defaultProps} {...props} />);
}

describe("PromptModal", () => {
  it("renders nothing when isOpen is false", () => {
    renderPromptModal({ isOpen: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the title, label and placeholder", () => {
    renderPromptModal();

    expect(screen.getByText("New folder")).toBeInTheDocument();
    expect(screen.getByText("Folder name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Folder name")).toBeInTheDocument();
  });

  it("renders the initial value in the input", () => {
    renderPromptModal({ initialValue: "Documents" });

    expect(screen.getByDisplayValue("Documents")).toBeInTheDocument();
  });

  it("renders the suffix when provided", () => {
    renderPromptModal({ suffix: ".pdf" });

    expect(screen.getByText(".pdf")).toBeInTheDocument();
  });

  it("does not render a suffix when not provided", () => {
    renderPromptModal();

    expect(screen.queryByText(".pdf")).not.toBeInTheDocument();
  });

  it("shows a validation error and does not call onSubmit when validation fails", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    renderPromptModal({ onSubmit, initialValue: "" });

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("trims the value before validating and submitting", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderPromptModal({ onSubmit, initialValue: "" });

    const input = screen.getByPlaceholderText("Folder name");
    await user.type(input, "  Documents  ");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Documents"));
  });

  it("calls onSubmit and onClose on successful submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    renderPromptModal({ onSubmit, onClose, initialValue: "Documents" });

    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Documents"));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("shows the server error and does not close when onSubmit rejects with a response error", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue({
      response: { data: { error: "A folder with that name already exists" } },
    });
    const onClose = vi.fn();

    renderPromptModal({ onSubmit, onClose, initialValue: "Documents" });

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("A folder with that name already exists"),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows a generic error when onSubmit rejects without a response error", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockRejectedValue(new Error("network down"));

    renderPromptModal({ onSubmit, initialValue: "Documents" });

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
  });

  it("disables the buttons while submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit;
    const onSubmit = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    renderPromptModal({ onSubmit, initialValue: "Documents" });

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolveSubmit();
    await waitFor(() =>
      expect(screen.queryByText("Saving...")).not.toBeInTheDocument(),
    );
  });

  it("calls onClose when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderPromptModal({ onClose });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("resets the form to initialValue and clears errors every time it opens", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const { rerender } = renderPromptModal({
      onSubmit,
      initialValue: "Documents",
      isOpen: false,
    });

    rerender(
      <PromptModal
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
        title="New folder"
        label="Folder name"
        placeholder="Folder name"
        submitLabel="Create"
        initialValue="Documents"
        validate={(value) => (!value ? "Name is required" : null)}
      />,
    );

    const input = screen.getByDisplayValue("Documents");
    await user.clear(input);
    await user.type(input, "Something else");

    // Close and reopen: value should reset back to initialValue
    rerender(
      <PromptModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        title="New folder"
        label="Folder name"
        placeholder="Folder name"
        submitLabel="Create"
        initialValue="Documents"
        validate={(value) => (!value ? "Name is required" : null)}
      />,
    );

    rerender(
      <PromptModal
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
        title="New folder"
        label="Folder name"
        placeholder="Folder name"
        submitLabel="Create"
        initialValue="Documents"
        validate={(value) => (!value ? "Name is required" : null)}
      />,
    );

    expect(screen.getByDisplayValue("Documents")).toBeInTheDocument();
  });

  it("submits without validation when no validate function is provided", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderPromptModal({ onSubmit, validate: undefined, initialValue: "" });

    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(""));
  });
});
