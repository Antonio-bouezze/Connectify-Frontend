function ChatChoiceModal({ onClose, onPrivateMessaging, onCreateRoom }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">Choose Chat Type</h2>
        <p className="modal-text">
          Select whether you want to start a private conversation or create a room.
        </p>

        <div className="choose-chat-actions-wrap">
          <div className="modal-actions choose-chat-actions">
           <button
           className="submit-btn choose-chat-btn private-btn"
           onClick={onPrivateMessaging}
           >
           Private Messaging
           </button>

           <button
            className="submit-btn choose-chat-btn room-btn"
            onClick={onCreateRoom}
             >
             Create Room
            </button>
          </div>

          <button className="nav-style-btn choose-chat-cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatChoiceModal;