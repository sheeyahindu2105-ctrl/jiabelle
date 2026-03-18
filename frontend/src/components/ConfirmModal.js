import "../styles/ConfirmModal.css";

function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  disabled = false, // ✅ NEW
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="modal-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={onCancel}
            disabled={disabled}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="confirm-btn"
            onClick={onConfirm}
            disabled={disabled} // 🔒 PREVENT SPAM
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
