import { useState } from "react";

import Modal from "./Modal";

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  isDestructive = false,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header title={title} onClose={onClose} />

      <Modal.Body>
        <p className="text-sm text-gray-600">{message}</p>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-60 ${
            isDestructive
              ? "bg-red-600 hover:bg-red-700"
              : "bg-gray-900 hover:bg-gray-800"
          }`}
        >
          {isSubmitting ? "Please wait..." : confirmLabel}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal;
