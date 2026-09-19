import { useEffect, useState } from "react";
import { X } from "lucide-react";

function Modal({ isOpen, onClose, children }) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
  }, [isOpen]);

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    if (!isOpen) setShouldRender(false);
  };

  useEffect(() => {
    if (!shouldRender) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shouldRender, onClose]);

  useEffect(() => {
    if (!shouldRender) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl bg-white shadow-lg transition-all duration-200 ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-2 scale-95 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-lg font-bold">{title}</span>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function ModalBody({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

function ModalFooter({ children }) {
  return <div className="flex justify-end gap-2 p-4">{children}</div>;
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
