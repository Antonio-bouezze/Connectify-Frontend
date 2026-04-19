import { useMemo, useState } from "react";
import AvatarPicker from "./AvatarPicker";
import { ROOM_ICONS } from "./iconRegistry";

function CreateRoomModal({ onClose, onCreateRoom }) {
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");

  const [showRoomIconPicker, setShowRoomIconPicker] = useState(false);
  const [showRoomIconConfirm, setShowRoomIconConfirm] = useState(false);
  const [selectedRoomIcon, setSelectedRoomIcon] = useState("");
  const [pendingRoomIcon, setPendingRoomIcon] = useState("");

  const SelectedRoomIconComp = useMemo(() => {
    return ROOM_ICONS.find((icon) => icon.name === selectedRoomIcon)?.component || null;
  }, [selectedRoomIcon]);

  const PendingRoomIconComp = useMemo(() => {
    return ROOM_ICONS.find((icon) => icon.name === pendingRoomIcon)?.component || null;
  }, [pendingRoomIcon]);

  const openRoomIconPicker = () => {
    setPendingRoomIcon(selectedRoomIcon || "");
    setShowRoomIconConfirm(false);
    setShowRoomIconPicker(true);
  };

  const closeRoomIconPicker = () => {
    setShowRoomIconPicker(false);
    setShowRoomIconConfirm(false);
  };

  const handlePendingRoomIconSelect = (iconName) => {
    setPendingRoomIcon(iconName);
    setShowRoomIconConfirm(true);
  };

  const confirmRoomIconSelection = () => {
    setSelectedRoomIcon(pendingRoomIcon);
    setError("");
    setShowRoomIconConfirm(false);
    setShowRoomIconPicker(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomName.trim()) {
      setError("Room name is required.");
      return;
    }

    if (!selectedRoomIcon) {
      setError("Please choose and confirm a room icon.");
      return;
    }

    onCreateRoom({
      roomName: roomName.trim(),
      roomIcon: selectedRoomIcon
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2 className="modal-title">Create Room</h2>
        <p className="modal-text">
          Enter the room name, choose a room icon, and the app will generate a room ID for you.
        </p>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Room Name</label>
            <input
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => {
                if(e.target.value.length <= 30){
                setRoomName(e.target.value);
                setError("");
                }
              }}
            />
            <p className="input-limit-text">
             {roomName.length}/30
            </p>
          </div>

          <div className="avatar-choose-row">
            <span className="avatar-choose-label">Choose room icon</span>

            <button
              type="button"
              className="avatar-preview-trigger"
              onClick={openRoomIconPicker}
            >
              {SelectedRoomIconComp ? (
                <SelectedRoomIconComp />
              ) : (
                <span className="avatar-preview-placeholder">+</span>
              )}
            </button>
          </div>

          {error && <span className="error-text">{error}</span>}

          <div className="modal-actions">
            <button type="submit" className="submit-btn">
              Create Room
            </button>

            <button type="button" className="nav-style-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {showRoomIconPicker && (
        <div className="avatar-popup-overlay" onClick={closeRoomIconPicker}>
          <div className="avatar-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-popup-header">
              <h3 className="avatar-popup-title">Choose room icon</h3>
              <button
                type="button"
                className="avatar-popup-close-btn"
                onClick={closeRoomIconPicker}
              >
                ✕
              </button>
            </div>

            <AvatarPicker
              type="room"
              selectedIcon={pendingRoomIcon}
              selectedColor=""
              onSelectIcon={handlePendingRoomIconSelect}
              onSelectColor={() => {}}
            />
          </div>

          {showRoomIconConfirm && (
            <div className="avatar-confirm-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="avatar-confirm-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="avatar-confirm-title">Confirm room icon</h3>
                <p className="avatar-confirm-text">
                  Do you want to use this room icon?
                </p>

                <div className="avatar-confirm-preview">
                  {PendingRoomIconComp && <PendingRoomIconComp />}
                </div>

                <div className="avatar-confirm-actions">
                  <button
                    type="button"
                    className="avatar-confirm-yes-btn"
                    onClick={confirmRoomIconSelection}
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    className="avatar-confirm-no-btn"
                    onClick={() => setShowRoomIconConfirm(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CreateRoomModal;