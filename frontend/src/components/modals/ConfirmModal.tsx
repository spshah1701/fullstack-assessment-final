import toast from "react-hot-toast";

/*
ConfirmModal component for showing a confirmation toast with custom callbacks.

Props:
title: The title of the confirmation toast.
message: The message body of the confirmation toast.
confirmText: The text to display on the confirm button.
cancelText: The text to display on the cancel button.
onConfirm: The callback function to execute when the confirm button is clicked.
onCancel: The optional callback function to execute when the cancel button is clicked.
*/
interface ConfirmToastOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

let confirmationToastId: string | null = null;

export const getConfirmationToastId = () => confirmationToastId;

export function confirmToast({
  title = "Confirm Delete",
  message = "Are you sure? This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmToastOptions) {
  // Dismiss any existing confirmation toast
  if (confirmationToastId) {
    toast.dismiss(confirmationToastId);
    confirmationToastId = null;
    window.dispatchEvent(new CustomEvent('confirmToastDismissed'));
  }

  const handleDismiss = () => {
    confirmationToastId = null;
    onCancel?.();
    // Trigger a custom event to notify components
    window.dispatchEvent(new CustomEvent('confirmToastDismissed'));
  };

  confirmationToastId = toast.custom(
    (t) => (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Blurred backdrop */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            pointerEvents: 'auto',
          }}
          onClick={() => {
            toast.dismiss(t.id);
            handleDismiss();
          }}
        />
        {/* Toast content */}
        <div
          style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '1.5rem',
            minWidth: '300px',
            maxWidth: '90%',
            border: '1px solid #e5e7eb',
            zIndex: 10000,
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>{message}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleDismiss();
              }}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: '#e5e7eb',
                borderRadius: '0.375rem',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1d5db')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            >
              {cancelText}
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                confirmationToastId = null;
                window.dispatchEvent(new CustomEvent('confirmToastDismissed'));
                await onConfirm();
              }}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: '#ef4444',
                borderRadius: '0.375rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      style: {
        background: 'transparent',
        boxShadow: 'none',
        padding: 0,
        margin: 0,
        maxWidth: 'none',
        width: 'auto',
        height: 'auto',
      },
      className: 'confirm-toast-overlay',
    }
  );

  // Notify that toast is shown
  window.dispatchEvent(new CustomEvent('confirmToastShown'));
}
