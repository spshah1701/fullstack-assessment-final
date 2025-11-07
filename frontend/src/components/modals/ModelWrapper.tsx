import React, { useEffect } from "react";
import { createPortal } from "react-dom";

// ModalWrapper component to provide a consistent modal layout and backdrop.
type Props = {
  children: React.ReactNode;
  onClose: () => void;
  zIndex?: number; 
  panelClassName?: string;
};

export const ModalWrapper: React.FC<Props> = ({
  children,
  onClose,
  zIndex = 600,
  panelClassName = "relative bg-white rounded-lg shadow-xl p-8 w-[480px] sm:w-[520px] md:w-[560px] lg:w-[600px] max-w-[92%] border border-gray-200",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 flex justify-center items-center"
      style={{ zIndex }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/10" />

      {/* Modal Panel */}
      <div
        className={panelClassName}
        style={{ zIndex: zIndex + 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
