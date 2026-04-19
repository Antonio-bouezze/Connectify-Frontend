import { useEffect, useMemo, useRef, useState } from "react";
import AvatarPicker from "./AvatarPicker";
import { ROOM_ICONS, USER_ICONS } from "./iconRegistry";
import { getUserById } from "./client";

const USERNAME_COLORS = [
  "#ff4d4f",
  "#52c41a",
  "#1677ff",
  "#fadb14",
  "#fa8c16",
  "#722ed1",
  "#eb2f96",
  "#13c2c2",
  "#2f54eb",
  "#a0d911",
  "#fa541c",
  "#9254de",
  "#36cfc9",
  "#ffc53d",
  "#ff85c0",
  "#73d13d",
  "#40a9ff",
  "#b37feb",
  "#95de64",
  "#5cdbd3",
  "#ff7875",
  "#ffd666",
  "#69c0ff",
  "#d3adf7"
];

function generateOverflowColor(username, usedColors) {
  let hash = 0;

  for (let i = 0; i < username.length; i += 1) {
    hash += username.charCodeAt(i);
  }

  let step = 0;
  let color = "";

  do {
    const hue = (hash + step * 41) % 360;
    color = `hsl(${hue}, 72%, 58%)`;
    step += 1;
  } while (usedColors.has(color));

  return color;
}

function RoomChat({
  currentUser,
  room,
  onBack,
  onSendMessage,
  onAddMember,
  onChangeRoomIcon,
  onToggleRoomPermission,
  onChangeRoomName,
  onLeaveRoom,
  onKickMember,
  onTransferLeadership
}){
  const [messageText, setMessageText] = useState("");
  const [memberTarget, setMemberTarget] = useState("");
  const [actionFeedback, setActionFeedback] = useState("");
  const [showRoomIconPicker, setShowRoomIconPicker] = useState(false);
  const [showRoomIconConfirm, setShowRoomIconConfirm] = useState(false);
  const [pendingRoomIcon, setPendingRoomIcon] = useState("");
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [pendingRoomName, setPendingRoomName] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const bottomRef = useRef(null);
  const roomTextareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room?.messages]);

  const colorMap = useMemo(() => {
    if (!room) return {};

    const usernames = [];

    room.members.forEach((member) => {
      if (!usernames.includes(member.username)) {
        usernames.push(member.username);
      }
    });

    room.messages.forEach((message) => {
      if (!usernames.includes(message.senderUsername)) {
        usernames.push(message.senderUsername);
      }
    });

    const map = {};
    const usedColors = new Set();

    usernames.forEach((username, index) => {
      let color = "";

      if (index < USERNAME_COLORS.length) {
        color = USERNAME_COLORS[index];
      } else {
        color = generateOverflowColor(username, usedColors);
      }

      map[username] = color;
      usedColors.add(color);
    });

    return map;
  }, [room]);

  const userLookup = useMemo(() => {
    if (!room) return {};

    const lookup = {};

    room.members.forEach((member) => {
      const fullUser = getUserById(member.userId);
      if (fullUser) {
        lookup[member.userId] = fullUser;
      }
    });

    return lookup;
  }, [room]);

  const RoomIconComp = useMemo(() => {
    if (!room?.icon) return null;
    return ROOM_ICONS.find((icon) => icon.name === room.icon)?.component || null;
  }, [room]);

  const PendingRoomIconComp = useMemo(() => {
    if (!pendingRoomIcon) return null;
    return ROOM_ICONS.find((icon) => icon.name === pendingRoomIcon)?.component || null;
  }, [pendingRoomIcon]);

  const getUserIconComponent = (userId) => {
    const fullUser = userLookup[userId];
    if (!fullUser?.icon) return null;
    return USER_ICONS.find((icon) => icon.name === fullUser.icon)?.component || null;
  };

  const getUserIconColor = (userId) => {
    return userLookup[userId]?.iconColor || "#ffffff";
  };

  const isRoomLeader = room?.ownerId === currentUser?.userId;

  const isLeaderUser = (userId) => {
  return room?.ownerId === userId;
};

  const openRoomNameEditor = () => {
  if (!room) return;

  const canEditName = isRoomLeader || room.allowNameEdit === true;

  if (!canEditName) {
    setActionFeedback("Room name editing is currently disabled.");
    return;
  }

  setPendingRoomName(room.roomName || "");
  setIsEditingRoomName(true);
};

const cancelRoomNameEditor = () => {
  setIsEditingRoomName(false);
  setPendingRoomName("");
};

const submitRoomNameChange = (e) => {
  e.preventDefault();

  if (!room) return;

  const result = onChangeRoomName(room.roomId, pendingRoomName);

  if (!result.success) {
    setActionFeedback(result.message);
    return;
  }

  setIsEditingRoomName(false);
  setPendingRoomName("");
  setActionFeedback(result.message);
 };

  const handleTogglePermission = (permissionKey) => {
  if (!room) return;

  const result = onToggleRoomPermission(
    room.roomId,
    permissionKey,
    !room[permissionKey]
  );

  setActionFeedback(result.message);
  };

  const openRoomIconPicker = () => {
  if (!room) return;

  const canEditIcon = isRoomLeader || room.allowIconEdit === true;

  if (!canEditIcon) {
    setActionFeedback("Room icon editing is currently disabled.");
    return;
  }

  setPendingRoomIcon(room.icon || "");
  setShowRoomIconConfirm(false);
  setShowRoomIconPicker(true);
  };

  const closeRoomIconPicker = () => {
    setShowRoomIconPicker(false);
    setShowRoomIconConfirm(false);
  };

  const handlePendingRoomIconSelect = (iconName) => {
    if (iconName === room?.icon) {
      setShowRoomIconPicker(false);
      setShowRoomIconConfirm(false);
      setActionFeedback("This icon is already selected.");
      return;
    }

    setPendingRoomIcon(iconName);
    setShowRoomIconConfirm(true);
  };

  const confirmRoomIconChange = () => {
    if (!room || !pendingRoomIcon) return;

    const result = onChangeRoomIcon(room.roomId, pendingRoomIcon);

    if (!result.success) {
      setShowRoomIconConfirm(false);
      setShowRoomIconPicker(false);
      setActionFeedback(result.message);
      return;
    }

    setShowRoomIconConfirm(false);
    setShowRoomIconPicker(false);
    setActionFeedback(result.message);
  };

  if (!room) {
    return (
      <div className="room-page">
        <div className="room-card">
          <button className="nav-style-btn room-back-btn" onClick={onBack}>
            Back
          </button>

          <p className="empty-state">Room not found.</p>
        </div>
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    const result = onSendMessage(room.roomId, messageText.trim());

    if (!result.success) {
      setActionFeedback(result.message);
      return;
    }

    setActionFeedback("");
    setMessageText("");

    if (roomTextareaRef.current) {
      roomTextareaRef.current.style.height = "56px";
      roomTextareaRef.current.style.overflowY = "hidden";
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();

    if (!memberTarget.trim()) return;

    const result = onAddMember(room.roomId, memberTarget.trim());

    setActionFeedback(result.message);

    if (result.success) {
      setMemberTarget("");
    }
  };
  const handleLeaveCurrentRoom = () => {
  if (!room) return;

  const result = onLeaveRoom(room.roomId);

  if (!result?.success) {
    setActionFeedback(result?.message || "Failed to leave room.");
    return;
  }

  setShowLeaveConfirm(false);
};

const handleKickMemberClick = (targetUserId) => {
  if (!room) return;

  const result = onKickMember(room.roomId, targetUserId);
  setActionFeedback(result.message);
};

const handleTransferLeadershipClick = (targetUserId) => {
  if (!room) return;

  const result = onTransferLeadership(room.roomId, targetUserId);
  setActionFeedback(result.message);
};

  return (
    <div className="room-page">
      <div className="room-card room-card-large">
        <button className="nav-style-btn room-back-btn" onClick={onBack}>
          Back
        </button>

        <div className="room-header room-header-compact">
  <div className="room-header-main room-header-main-compact">
    <div className="room-header-left">
      <button
        type="button"
        className={`room-header-icon room-header-icon-btn ${
          isRoomLeader || room.allowIconEdit ? "is-clickable" : ""
        }`}
        onClick={openRoomIconPicker}
      >
        {RoomIconComp ? (
          <RoomIconComp />
        ) : (
          <span className="room-header-icon-fallback">#</span>
        )}
      </button>

      <div className="room-header-texts">
        {isEditingRoomName ? (
          <form className="room-name-edit-form" onSubmit={submitRoomNameChange}>
            <input
              type="text"
              className="room-name-edit-input"
              value={pendingRoomName}
              maxLength={30}
              onChange={(e) => setPendingRoomName(e.target.value)}
              placeholder="Enter room name"
            />

            <div className="room-name-edit-actions">
              <button type="submit" className="room-name-save-btn">
                Save
              </button>

              <button
                type="button"
                className="room-name-cancel-btn"
                onClick={cancelRoomNameEditor}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="room-title-row">
            <h1 className="room-title">{room.roomName}</h1>

            <button
              type="button"
              className="room-title-edit-btn"
              onClick={openRoomNameEditor}
            >
              Edit Name
            </button>
          </div>
        )}

        <p className="room-id">
          <strong>Room ID:</strong> {room.roomId}
        </p>
      </div>
    </div>

    <div className="room-header-right">
      <button
  type="button"
  className="room-top-action-btn room-leave-trigger-btn"
  onClick={() => setShowLeaveConfirm(true)}
>
  Leave
</button>
      <button
        type="button"
        className={`room-top-action-btn room-mini-toggle-btn ${
          room.allowMessaging ? "room-toggle-enabled" : "room-toggle-disabled"
        }`}
        onClick={() => isRoomLeader && handleTogglePermission("allowMessaging")}
        disabled={!isRoomLeader}
        title={isRoomLeader ? "Toggle messaging permission" : "Leader only"}
      >
        Messaging
      </button>

      <button
        type="button"
        className={`room-top-action-btn room-mini-toggle-btn ${
          room.allowNameEdit ? "room-toggle-enabled" : "room-toggle-disabled"
        }`}
        onClick={() => isRoomLeader && handleTogglePermission("allowNameEdit")}
        disabled={!isRoomLeader}
        title={isRoomLeader ? "Toggle name edit permission" : "Leader only"}
      >
        Name Edit
      </button>

      <button
        type="button"
        className={`room-top-action-btn room-mini-toggle-btn ${
          room.allowIconEdit ? "room-toggle-enabled" : "room-toggle-disabled"
        }`}
        onClick={() => isRoomLeader && handleTogglePermission("allowIconEdit")}
        disabled={!isRoomLeader}
        title={isRoomLeader ? "Toggle icon edit permission" : "Leader only"}
      >
        Icon Edit
      </button>
    </div>
  </div>
</div>
        <div className="room-layout room-layout-large">
          <div className="room-main-panel">
            <div className="room-messages-box room-messages-box-large">
              <h3>Room Conversation</h3>

              {room.messages.length === 0 ? (
                <p className="empty-state">No room messages yet.</p>
              ) : (
                room.messages.map((msg) => {
                  const isOwnMessage = msg.senderId === currentUser.userId;
                  const IconComp = getUserIconComponent(msg.senderId);

                  return (
                    <div
                      key={msg.id}
                      className={`room-message-row ${isOwnMessage ? "own" : "other"}`}
                    >
                      {!isOwnMessage && (
                        <div className="room-message-avatar">
                          {IconComp ? (
                            <IconComp style={{ color: getUserIconColor(msg.senderId) }} />
                          ) : (
                            <span className="room-message-avatar-fallback">?</span>
                          )}
                        </div>
                      )}

                      <div
                        className={`room-message-item compact-room-message-item ${
                          isOwnMessage ? "own" : "other"
                        }`}
                      >
                        <div className="room-message-header">
                          <span
                            className="room-message-username"
                             style={{ color: colorMap[msg.senderUsername] || "#ffffff" }}
                            >
                            {msg.senderUsername}
                               {isLeaderUser(msg.senderId) && (
                               <span className="leader-crown" title="Room Leader">👑</span>
                             )}
                          </span>

                          <span className="room-message-time">{msg.timestamp}</span>
                        </div>

                        <p className="room-message-text">{msg.text}</p>
                      </div>

                      {isOwnMessage && (
                        <div className="room-message-avatar">
                          {IconComp ? (
                            <IconComp style={{ color: getUserIconColor(msg.senderId) }} />
                          ) : (
                            <span className="room-message-avatar-fallback">?</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              <div ref={bottomRef} />
            </div>

            <form className="room-message-form" onSubmit={handleSend}>
              <textarea
                ref={roomTextareaRef}
                className="room-message-form-input-text"
                placeholder="Send a message...!"
                value={messageText}
                rows={1}
                onChange={(e) => {
                  setMessageText(e.target.value);

                  e.target.style.height = "56px";

                  const newHeight = Math.min(e.target.scrollHeight, 150);
                  e.target.style.height = `${newHeight}px`;

                  if (e.target.scrollHeight > 150) {
                    e.target.style.overflowY = "auto";
                  } else {
                    e.target.style.overflowY = "hidden";
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />

              <button type="submit">Send</button>
            </form>
          </div>

          <div className="room-side-panel">
            <div className="add-member-card">
              <h3>
                ADD PEOPLE <span className="room-add-people-par">(By ID or Username)</span>
              </h3>

              <form className="add-member-form" onSubmit={handleAddMember}>
                <input
                  type="text"
                  placeholder="Type..."
                  value={memberTarget}
                  onChange={(e) => setMemberTarget(e.target.value)}
                />

                <button type="submit">Add Member</button>
              </form>
            </div>

            <div className="members-list-card">
              <h3>Room Members</h3>

              {room.members.length === 0 ? (
                <p className="empty-state">No members yet.</p>
              ) : (
                <div className="members-list">
                  {room.members.map((member) => {
                    const MemberIcon = getUserIconComponent(member.userId);

                    return (
                      <div key={member.userId} className="member-item">
                        <div className="member-item-main">
  <div className="member-avatar">
    {MemberIcon ? (
      <MemberIcon style={{ color: getUserIconColor(member.userId) }} />
    ) : (
      <span className="member-avatar-fallback">?</span>
    )}
  </div>

  <div className="member-texts">
    <p>
      <strong style={{ color: colorMap[member.username] || "#ffffff" }}>
        {member.username}
        {isLeaderUser(member.userId) && (
          <span className="leader-crown" title="Room Leader">👑</span>
        )}
      </strong>
    </p>

    <p>
      <span className="member-id-light">ID: {member.userId}</span>
    </p>
  </div>
</div>
{isRoomLeader && member.userId !== currentUser.userId && (
  <div className="member-actions">
    <button
      type="button"
      className="transfer-leader-btn"
      onClick={() => handleTransferLeadershipClick(member.userId)}
    >
      Transfer Leader
    </button>

    <button
      type="button"
      className="kick-member-btn"
      onClick={() => handleKickMemberClick(member.userId)}
    >
      Kick
    </button>
  </div>
)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
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
                  {PendingRoomIconComp ? (
                    <PendingRoomIconComp />
                  ) : (
                    <span className="room-header-icon-fallback">#</span>
                  )}
                </div>

                <div className="avatar-confirm-actions">
                  <button
                    type="button"
                    className="avatar-confirm-yes-btn"
                    onClick={confirmRoomIconChange}
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

      {showLeaveConfirm && (
  <div className="room-feedback-overlay" onClick={() => setShowLeaveConfirm(false)}>
    <div className="room-feedback-card" onClick={(e) => e.stopPropagation()}>
      <p className="room-feedback-text">
        Are you sure you want to leave this room?
      </p>

      <div className="leave-confirm-actions">
        <button
          className="leave-confirm-yes-btn"
          onClick={handleLeaveCurrentRoom}
        >
          Yes, Leave
        </button>

        <button
          className="leave-confirm-no-btn"
          onClick={() => setShowLeaveConfirm(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      {actionFeedback && (
        <div className="room-feedback-overlay" onClick={() => setActionFeedback("")}>
          <div className="room-feedback-card" onClick={(e) => e.stopPropagation()}>
            <p className="room-feedback-text">{actionFeedback}</p>

            <button
              className="room-feedback-ok-btn"
              onClick={() => setActionFeedback("")}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomChat;