import ChatHistoryPanel from "./ChatHistoryPanel";
import AvatarPicker from "./AvatarPicker";
import { USER_ICONS } from "./iconRegistry";
import { useEffect, useMemo , useState} from "react";
import {updateUserAvatar} from "./client";

function UserHomePage({
  currentUser,
  onNavigate,
  onOpenChat,
  onLogout,
  appData,
  privacyEnabled,
  onTogglePrivacy,
  onOpenPrivateChat,
  onOpenRoom,
  onRespondInvitation,
  onDismissDecline,
  onAvatarUpdated
}) {
   const SelectedIcon = useMemo(() => {
  return USER_ICONS.find((i) => i.name === currentUser.icon)?.component || null;
}, [currentUser.icon]);

const [showAvatarPicker, setShowAvatarPicker] = useState(false);
const [showAvatarConfirm, setShowAvatarConfirm] = useState(false);
const [pendingIcon, setPendingIcon] = useState("");
const [pendingIconColor, setPendingIconColor] = useState("");
const [avatarFeedback, setAvatarFeedback] = useState("");
const [showGreeting, setShowGreeting] = useState(true);


const PendingUserIcon = useMemo(() => {
  return USER_ICONS.find((icon) => icon.name === pendingIcon)?.component || null;
}, [pendingIcon]);

const openAvatarPicker = () => {
  setPendingIcon(currentUser.icon || "");
  setPendingIconColor(currentUser.iconColor || "");
  setShowAvatarConfirm(false);
  setShowAvatarPicker(true);
  setAvatarFeedback("");
};

const closeAvatarPicker = () => {
  setShowAvatarPicker(false);
  setShowAvatarConfirm(false);
  setAvatarFeedback("");
};

const handlePendingIconSelect = (iconName) => {
  setPendingIcon(iconName);
  setPendingIconColor("");
  setShowAvatarConfirm(false);
  setAvatarFeedback("");
};

const handlePendingColorSelect = (color) => {
  setPendingIconColor(color);
  setShowAvatarConfirm(true);
  setAvatarFeedback("");
};

const confirmAvatarSelection = () => {
  if (!pendingIcon || !pendingIconColor) return;

  if (
    pendingIcon === currentUser.icon &&
    pendingIconColor === currentUser.iconColor
  ) {
    setShowAvatarConfirm(false);
    setAvatarFeedback("This icon is already selected.");
    return;
  }

  const updatedUser = updateUserAvatar(
    currentUser.userId,
    pendingIcon,
    pendingIconColor
  );

  if (!updatedUser) {
    setShowAvatarConfirm(false);
    setAvatarFeedback("Failed to update avatar.");
    return;
  }

  onAvatarUpdated(updatedUser);
setShowAvatarConfirm(false);
setShowAvatarPicker(false);
setAvatarFeedback("");
};
useEffect(() => {
  const timer = setTimeout(() => {
    setShowGreeting(false);
  }, 15000);

  return () => clearTimeout(timer);
}, []);
  return (
    <div className="user-home-page">
      <header className="user-top-bar">
       <div className="user-top-bar-left">
        <div className="profile-block">
         <div className="profile-avatar" onClick={openAvatarPicker}>
  {SelectedIcon ? (
    <SelectedIcon style={{ color: currentUser.iconColor }} />
  ) : (
    <span className="profile-avatar-fallback">?</span>
  )}
</div>

         <div className="profile-info">
          <div className="profile-username">
           {currentUser.username}
          </div>

          <div className="profile-fullname">
           {currentUser.firstName} {currentUser.lastName}
          </div>

          <div className="profile-id">
           ID: {currentUser.userId}
          </div>
         </div>
        </div>
       </div>

       <div className="user-top-bar-right">
        <button onClick={onOpenChat}>Chat</button>
        <button onClick={() => onNavigate("about")}>About</button>
        <button onClick={() => onNavigate("contact")}>Contact</button>
        <button onClick={onLogout}>Log-out</button>
       </div>
      </header>

      <main className="user-dashboard">
        <div className="user-dashboard-left">
         {showGreeting && (
  <div className="user-home-side-greeting premium-greeting-banner">
    <div className="premium-greeting-banner-top">
      <div className="premium-greeting-badge">✨ CONNECTIFY READY</div>
    </div>

    <div className="premium-greeting-banner-body">
      <h2 className="user-home-side-title premium-greeting-title">
        Welcome back, {currentUser.firstName}.
      </h2>

      <p className="user-home-side-text premium-greeting-text">
        Your Connectify workspace is fully prepared — private messaging, room
        conversations, invitations, and smart controls are all ready for you.
      </p>

      <p className="premium-greeting-subtext">
        Jump in, connect faster, and enjoy a smoother communication experience.
      </p>
    </div>
  </div>
)}

        </div>

        <div className="user-dashboard-right">
          <ChatHistoryPanel
            currentUser={currentUser}
            appData={appData}
            privacyEnabled={privacyEnabled}
            onTogglePrivacy={onTogglePrivacy}
            onOpenPrivateChat={onOpenPrivateChat}
            onOpenRoom={onOpenRoom}
            onRespondInvitation={onRespondInvitation}
            onDismissDecline={onDismissDecline}
          />
        </div>
      </main>
          

      {showAvatarPicker && (
        <div className="avatar-popup-overlay" onClick={closeAvatarPicker}>
          <div className="avatar-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-popup-header">
              <h3 className="avatar-popup-title">Choose your icon</h3>
              <button
                type="button"
                className="avatar-popup-close-btn"
                onClick={closeAvatarPicker}
              >
                ✕
              </button>
            </div>

            <AvatarPicker
              type="user"
              selectedIcon={pendingIcon}
              selectedColor={pendingIconColor}
              onSelectIcon={handlePendingIconSelect}
              onSelectColor={handlePendingColorSelect}
            />

            {avatarFeedback && (
              <div className="form-submit-error" style={{ marginTop: "14px" }}>
                {avatarFeedback}
              </div>
            )}
          </div>

          {showAvatarConfirm && (
            <div className="avatar-confirm-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="avatar-confirm-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="avatar-confirm-title">Confirm avatar</h3>
                <p className="avatar-confirm-text">
                  Do you want to use this avatar?
                </p>

                <div className="avatar-confirm-preview">
                  {PendingUserIcon ? (
                    <PendingUserIcon style={{ color: pendingIconColor }} />
                  ) : (
                    <span className="profile-avatar-fallback">?</span>
                  )}
                </div>

                <div className="avatar-confirm-actions">
                  <button
                    type="button"
                    className="avatar-confirm-yes-btn"
                    onClick={confirmAvatarSelection}
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    className="avatar-confirm-no-btn"
                    onClick={() => setShowAvatarConfirm(false)}
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

export default UserHomePage;