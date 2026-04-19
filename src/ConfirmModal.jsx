function ConfirmModal({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-card">
        <p>Are you sure you want to apply this change?</p>

        <div className="confirm-actions">
          <button className="confirm-yes" onClick={onConfirm}>Yes</button>
          <button className="confirm-no" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;