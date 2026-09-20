import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ConfirmModal from "./ConfirmModal";

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", (cb) => {
    cb();
    return 0;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

function renderConfirmModal(props = {}) {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
    title: "Delete folder",
    message: "Are you sure you want to delete this folder?",
  };

  return render(<ConfirmModal {...defaultProps} {...props} />);
}

describe("ConfirmModal", () => {
  it("renders nothing when isOpen is false", () => {
    renderConfirmModal({ isOpen: false });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the title and message", () => {
    renderConfirmModal();

    expect(screen.getByText("Delete folder")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this folder?"),
    ).toBeInTheDocument();
  });

  it("renders JSX messages, not just plain strings", () => {
    renderConfirmModal({
      message: (
        <>
          Are you sure you want to delete <strong>report.pdf</strong>?
        </>
      ),
    });

    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("uses the default confirm label when none is provided", () => {
    renderConfirmModal();

    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("uses a custom confirm label when provided", () => {
    renderConfirmModal({ confirmLabel: "Delete" });

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls onClose when the Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderConfirmModal({ onClose });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm and then onClose when confirmed successfully", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    renderConfirmModal({ onConfirm, onClose, confirmLabel: "Delete" });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it("does not call onClose when onConfirm rejects", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error("delete failed"));
    const onClose = vi.fn();

    renderConfirmModal({ onConfirm, onClose, confirmLabel: "Delete" });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("re-enables the buttons after onConfirm rejects, so the user can retry", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error("delete failed"));

    renderConfirmModal({ onConfirm, confirmLabel: "Delete" });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled(),
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
  });

  it("disables both buttons and shows a waiting label while submitting", async () => {
    const user = userEvent.setup();
    let resolveConfirm;
    const onConfirm = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveConfirm = resolve;
        }),
    );

    renderConfirmModal({ onConfirm, confirmLabel: "Delete" });

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      screen.getByRole("button", { name: "Please wait..." }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    resolveConfirm();
    await waitFor(() =>
      expect(screen.queryByText("Please wait...")).not.toBeInTheDocument(),
    );
  });

  it("applies the destructive style when isDestructive is true", () => {
    renderConfirmModal({ isDestructive: true, confirmLabel: "Delete" });

    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
      "bg-red-600",
    );
  });

  it("applies the default style when isDestructive is false", () => {
    renderConfirmModal({ isDestructive: false, confirmLabel: "Delete" });

    expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
      "bg-gray-900",
    );
  });
});
