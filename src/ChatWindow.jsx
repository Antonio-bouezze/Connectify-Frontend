import { useEffect, useMemo, useRef, useState } from "react";
import { USER_ICONS } from "./iconRegistry";

const OWN_PRIVATE_NAME_COLOR = "#8fd4ff";
const OTHER_PRIVATE_NAME_COLOR = "#b37feb";

function ChatWindow({ currentUser, currentPartner, messages, onSwitchPrivateChat, onBack }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const CurrentUserIcon = useMemo(() => {
    return USER_ICONS.find((icon) => icon.name === currentUser?.icon)?.component || null;
  }, [currentUser]);

  const CurrentPartnerIcon = useMemo(() => {
    return USER_ICONS.find((icon) => icon.name === currentPartner?.icon)?.component || null;
  }, [currentPartner]);

  const [switchTarget, setSwitchTarget] = useState("");
  const [switchFeedback, setSwitchFeedback] = useState("");

  return (
    <div className="chat-window">
      <div className="private-chat-topbar">
        <div className="private-chat-topbar-left">
          <div className="private-chat-topbar-avatar">
            {currentPartner && CurrentPartnerIcon ? (
              <CurrentPartnerIcon style={{ color: currentPartner.iconColor }} />
            ) : (
              <span className="private-chat-topbar-avatar-fallback">?</span>
            )}
          </div>

          <div className="private-chat-topbar-info">
            <div className="private-chat-topbar-username">
              {currentPartner ? currentPartner.username : "No chat selected"}
            </div>

            <div className="private-chat-topbar-id">
              {currentPartner ? `ID: ${currentPartner.userId}` : "Open a private chat from history"}
            </div>
          </div>
        </div>

        <div className="private-chat-topbar-center">
          <button type="button" className="private-chat-back-btn" onClick={onBack}>
            Back
          </button>
        </div>

        <form
          className="private-chat-switch-form"
          onSubmit={(e) => {
            e.preventDefault();

            if (!switchTarget.trim()) return;

            const result = onSwitchPrivateChat(switchTarget.trim());

            if (!result.success) {
              setSwitchFeedback(result.message);
              return;
            }

            setSwitchTarget("");
          }}
        >
          <input
            type="text"
            className="private-chat-switch-input"
            placeholder="Username or ID"
            value={switchTarget}
            onChange={(e) => setSwitchTarget(e.target.value)}
          />

          <button type="submit" className="private-chat-switch-btn">
            OK
          </button>
        </form>
      </div>  

      <div className="messages-box">
        {messages.length === 0 ? (
          <p className="empty-state">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.senderId === currentUser.userId;
            const IconComp = isOwnMessage ? CurrentUserIcon : CurrentPartnerIcon;
            const iconColor = isOwnMessage
              ? currentUser.iconColor
              : currentPartner?.iconColor || "#ffffff";

            return (
              <div
                key={msg.id}
                className={`private-message-row ${isOwnMessage ? "own" : "other"}`}
              >
                {!isOwnMessage && (
                  <div className="private-message-avatar">
                    {IconComp ? (
                      <IconComp style={{ color: iconColor }} />
                    ) : (
                      <span className="private-message-avatar-fallback">?</span>
                    )}
                  </div>
                )}

                <div
                  className={`private-message-card ${isOwnMessage ? "own" : "other"}`}
                >
                  <div className="private-message-meta">
                    <span
                      className={`private-message-username ${isOwnMessage ? "own" : "other"}`}
                      style={{
                        color: isOwnMessage
                          ? OWN_PRIVATE_NAME_COLOR
                          : OTHER_PRIVATE_NAME_COLOR
                      }}
                    >
                      {msg.senderUsername}
                    </span>

                    <span className="private-message-time">{msg.timestamp}</span>
                  </div>

                  <p className="private-message-text">{msg.text}</p>
                </div>

                {isOwnMessage && (
                  <div className="private-message-avatar">
                    {IconComp ? (
                      <IconComp style={{ color: iconColor }} />
                    ) : (
                      <span className="private-message-avatar-fallback">?</span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

                <div ref={bottomRef} />
      </div>

      {switchFeedback && (
        <div
          className="room-feedback-overlay"
          onClick={() => setSwitchFeedback("")}
        >
          <div
            className="room-feedback-card"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="room-feedback-text">{switchFeedback}</p>

            <button
              className="room-feedback-ok-btn"
              onClick={() => setSwitchFeedback("")}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;