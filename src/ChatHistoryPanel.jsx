import { useMemo, useState } from "react";
import {
  getChatHistoryForUser,
  getDeclinedInvitationResults
} from "./chatStore";
import { USER_ICONS, ROOM_ICONS } from "./iconRegistry";
import { getUserById } from "./client";

function truncateTitle(text) {
  if (!text) return "";
  if (text.length <= 26) return text.toUpperCase();
  return `${text.slice(0, 26).toUpperCase()}...`;
}

function truncatePreview(text) {
  if (!text) return "";
  if (text.length <= 34) return text;
  return `${text.slice(0, 34)}...`;
}

function SingleUserHistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4.2" fill="currentColor" />
      <path
        d="M5.2 20.2c0-3.55 2.95-6.2 6.8-6.2s6.8 2.65 6.8 6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GroupHistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7.8" r="3.2" fill="currentColor" />
      <circle cx="6.8" cy="10.2" r="2.4" fill="currentColor" opacity="0.92" />
      <circle cx="17.2" cy="10.2" r="2.4" fill="currentColor" opacity="0.92" />
      <path
        d="M4.8 19.6c0-2.55 2.15-4.5 5.1-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14.1 15.1c2.95 0 5.1 1.95 5.1 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 20.2c0-3 2.15-5.15 4-5.15s4 2.15 4 5.15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InviteBellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="4"
        y="6"
        width="14"
        height="10"
        rx="2.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5.4 7.3l5.6 4.5 5.6-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18.5" cy="17.5" r="4.2" fill="currentColor" opacity="0.16" />
      <path
        d="M16.8 17.6l1.2 1.2 2.3-2.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getHistoryTypeIconComponent(type) {
  return type === "room" ? GroupHistoryIcon : SingleUserHistoryIcon;
}

function getRoomPreviewParts(preview) {
  const safePreview = preview || "";

  if (!safePreview.includes(":")) {
    return {
      sender: "",
      message: safePreview
    };
  }

  const firstColonIndex = safePreview.indexOf(":");

  return {
    sender: safePreview.slice(0, firstColonIndex).trim(),
    message: safePreview.slice(firstColonIndex + 1).trim()
  };
}

function formatInvitationDateTime(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) return "";

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${weekdays[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${hours}:${minutes}`;
}

function getInvitationMetaText(invite) {
  if (invite.status === "pending") {
    return formatInvitationDateTime(invite.createdAt);
  }

  return formatInvitationDateTime(invite.respondedAt || invite.createdAt);
}

function ChatHistoryPanel({
  currentUser,
  appData,
  privacyEnabled,
  onTogglePrivacy,
  onOpenPrivateChat,
  onOpenRoom,
  onRespondInvitation,
  onDismissDecline
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInvitePanel, setShowInvitePanel] = useState(false);

  const historyItems = useMemo(() => {
    return getChatHistoryForUser(appData, currentUser.userId);
  }, [appData, currentUser.userId]);

  const roomLookup = useMemo(() => {
    const map = {};
    (appData.rooms || []).forEach((room) => {
      map[room.roomId] = room;
    });
    return map;
  }, [appData.rooms]);

  const invitationItems = useMemo(() => {
    return [...(appData.invitations || [])]
      .filter((invite) => invite.toUserId === currentUser.userId)
      .sort((a, b) => {
        const aRank = a.status === "pending" ? 0 : 1;
        const bRank = b.status === "pending" ? 0 : 1;

        if (aRank !== bRank) {
          return aRank - bRank;
        }

        const aTime = new Date(
          a.status === "pending" ? a.createdAt : a.respondedAt || a.createdAt
        ).getTime();

        const bTime = new Date(
          b.status === "pending" ? b.createdAt : b.respondedAt || b.createdAt
        ).getTime();

        return bTime - aTime;
      });
  }, [appData.invitations, currentUser.userId]);

  const pendingInviteCount = useMemo(() => {
    return invitationItems.filter((invite) => invite.status === "pending").length;
  }, [invitationItems]);

  const declinedResults = useMemo(() => {
    return getDeclinedInvitationResults(appData, currentUser.userId);
  }, [appData, currentUser.userId]);

  const filteredHistory = historyItems.filter((item) =>
    item.title.toLowerCase().startsWith(searchTerm.trim().toLowerCase())
  );

  const firstDeclinedResult = declinedResults[0] || null;

  return (
    <>
      <div className="history-panel-shell">
        <div className="history-panel">
          <div className="privacy-key-card">
            <div className="privacy-copy">
              <h3 className="privacy-title">Privacy Key</h3>
              <p className="privacy-description">
                Require your approval before others can add you directly to rooms , when enabled no other user can add you to any room!
              </p>
            </div>

            <button
              type="button"
              className={`privacy-toggle-btn ${privacyEnabled ? "privacy-enabled" : "privacy-disabled"}`}
              onClick={onTogglePrivacy}
            >
              {privacyEnabled ? "ON" : "OFF"}
            </button>
          </div>

          <div className="history-search-wrapper">
            <input
              type="text"
              className="history-search-input"
              placeholder="Search chat history."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="history-list">
            {filteredHistory.length === 0 ? (
              <p className="history-empty-text">No matching rooms or private chats found.</p>
            ) : (
              filteredHistory.map((item) => {
                const TypeIcon = getHistoryTypeIconComponent(item.type);
                const roomPreview =
                  item.type === "room" ? getRoomPreviewParts(item.preview) : null;

                let LeftIconComp = null;
                let leftIconColor = "#ffffff";

                if (item.type === "private") {
                  const otherUser = getUserById(item.targetId);

                  if (otherUser?.icon) {
                    LeftIconComp =
                      USER_ICONS.find((icon) => icon.name === otherUser.icon)?.component || null;
                    leftIconColor = otherUser.iconColor || "#ffffff";
                  }
                } else if (item.type === "room") {
                  const room = roomLookup[item.roomId];

                  if (room?.icon) {
                    LeftIconComp =
                      ROOM_ICONS.find((icon) => icon.name === room.icon)?.component || null;
                  }
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`history-item history-item-${item.type}`}
                    onClick={() =>
                      item.type === "private"
                        ? onOpenPrivateChat(item.targetId)
                        : onOpenRoom(item.roomId)
                    }
                  >
                    <div className="history-item-content">
                      <div className="history-item-top-row">
                        <div className="history-item-title-row">
                          <div className="history-item-left">
                            <div className="history-item-left-icon">
                              {LeftIconComp ? (
                                <LeftIconComp style={{ color: leftIconColor }} />
                              ) : (
                                <span className="history-item-left-fallback">#</span>
                              )}
                            </div>

                            <div className="history-item-title">
                              {truncateTitle(item.title)}
                            </div>
                          </div>
                        </div>

                        <div className="history-trailing-type-icon" aria-hidden="true">
                          <TypeIcon />
                        </div>
                      </div>

                      <div className="history-item-bottom-row">
                        {item.type === "room" ? (
                          <div className="history-item-preview history-item-preview-room">
                            {roomPreview?.sender ? (
                              <>
                                <span className="history-room-preview-sender">
                                  {truncatePreview(roomPreview.sender)}
                                </span>
                                <span className="history-room-preview-separator">: </span>
                                <span className="history-room-preview-message">
                                  {truncatePreview(roomPreview.message)}
                                </span>
                              </>
                            ) : (
                              <span className="history-room-preview-message">
                                {truncatePreview(item.preview)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="history-item-preview">
                            {truncatePreview(item.preview)}
                          </div>
                        )}

                        {item.unreadCount > 0 && (
                          <div className="unread-count-badge">{item.unreadCount}</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="invite-fab-area">
          {showInvitePanel && (
            <div className="invite-dropup-panel">
              <div className="invite-dropup-header">
                <h4 className="invite-dropup-title">Invitations</h4>
              </div>

              <div className="invite-dropup-list">
                {invitationItems.length === 0 ? (
                  <p className="invite-dropup-empty">No invitations yet.</p>
                ) : (
                  invitationItems.map((invite) => {
                    const room = roomLookup[invite.roomId];
                    const InviteRoomIcon =
                      ROOM_ICONS.find((icon) => icon.name === room?.icon)?.component || null;

                    return (
                      <div
                        key={invite.id}
                        className={`invite-dropup-card invite-status-${invite.status}`}
                      >
                        <div className="invite-row">
                          <div className="invite-room-icon">
                            {InviteRoomIcon ? (
                              <InviteRoomIcon />
                            ) : (
                              <span>#</span>
                            )}
                          </div>

                          <div className="invite-content">
                            <p className="invite-dropup-text">
                              {invite.status === "accepted" && (
                                <>
                                  You accepted the invitation from{" "}
                                  <span
                                    className="invite-username"
                                    style={{ color: "#8fd4ff" }}
                                  >
                                    {invite.fromUsername}
                                  </span>{" "}
                                  to join{" "}
                                  <span className="invite-room-name">
                                    "{invite.roomName}"
                                  </span>
                                  .
                                </>
                              )}

                              {invite.status === "declined" && (
                                <>
                                  You declined the invitation from{" "}
                                  <span
                                    className="invite-username"
                                    style={{ color: "#8fd4ff" }}
                                  >
                                    {invite.fromUsername}
                                  </span>{" "}
                                  to join{" "}
                                  <span className="invite-room-name">
                                    "{invite.roomName}"
                                  </span>
                                  .
                                </>
                              )}

                              {invite.status === "pending" && (
                                <>
                                  Join the room{" "}
                                  <span className="invite-room-name">
                                    "{invite.roomName}"
                                  </span>{" "}
                                  invited by{" "}
                                  <span
                                    className="invite-username"
                                    style={{ color: "#8fd4ff" }}
                                  >
                                    {invite.fromUsername}
                                  </span>
                                  ?
                                </>
                              )}
                            </p>

                            <p className="invite-dropup-meta">
                              {getInvitationMetaText(invite)}
                            </p>

                            {invite.status === "pending" && (
                              <div className="invite-dropup-actions">
                                <button
                                  type="button"
                                  className="accept-invite-btn"
                                  onClick={() => onRespondInvitation(invite.id, true)}
                                >
                                  Accept
                                </button>

                                <button
                                  type="button"
                                  className="decline-invite-btn"
                                  onClick={() => onRespondInvitation(invite.id, false)}
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <button
            type="button"
            className="invite-fab-btn"
            onClick={() => setShowInvitePanel((prev) => !prev)}
          >
            <span className="invite-fab-icon">
              <InviteBellIcon />
            </span>

            {pendingInviteCount > 0 && (
              <span className="invite-fab-badge">{pendingInviteCount}</span>
            )}
          </button>
        </div>
      </div>

      {firstDeclinedResult && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Room Invitation Update</h2>
            <p className="decline-result-text">
              {firstDeclinedResult.toUsername} declined and refused to join your room.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="submit-btn"
                onClick={() => onDismissDecline(firstDeclinedResult.id)}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatHistoryPanel;