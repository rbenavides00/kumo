import { useEffect, useState } from "react";

import Modal from "./Modal";

function PromptModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  label,
  placeholder,
  initialValue = "",
  suffix,
  submitLabel = "Save",
  validate,
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = value.trim();
    const validationError = validate?.(trimmed);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error ?? "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <Modal.Header title={title} onClose={onClose} />

        <Modal.Body className="flex flex-col gap-3">
          {label && (
            <label className="text-sm font-medium text-gray-700">{label}</label>
          )}

          <div className="flex items-center rounded-lg border border-gray-300 focus-within:border-gray-500">
            <input
              type="text"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none"
            />
            {suffix && (
              <span className="shrink-0 pr-3 text-sm text-gray-400">
                {suffix}
              </span>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
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
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default PromptModal;
