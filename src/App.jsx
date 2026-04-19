import { useState } from "react";
import "./App.css";
import HomePage from "./HomePage";
import LoginForm from "./LoginForm";
import ChatApp from "./ChatApp";
import UserHomePage from "./UserHomePage";
import LoginModal from "./LoginModal";
import ChatChoiceModal from "./ChatChoiceModal";
import CreateRoomModal from "./CreateRoomModal";
import RoomChat from "./RoomChat";
import ContactPage from "./ContactPage";
import AboutPage from "./AboutPage";
import {
  findUserByTarget,
  getUserById,
  registerUser
} from "./client";
import {
  addUserToRoomOrInvite,
  createPrivateMessage,
  createRoom,
  createRoomMessage,
  dismissDeclineResult,
  getPrivateChatBetween,
  getRoomById,
  getUserPrivacy,
  loadChatData,
  markPrivateChatRead,
  markRoomRead,
  respondToInvitation,
  saveChatData,
  setUserPrivacy,
  updateRoomIcon,
  updateRoomPermission,
  updateRoomName,
  leaveRoom,
  kickMemberFromRoom,
  transferRoomLeadership
} from "./chatStore";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChatChoiceModal, setShowChatChoiceModal] = useState(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  const [appData, setAppData] = useState(() => loadChatData());
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [activePrivatePartnerId, setActivePrivatePartnerId] = useState(null);

  const persistAppData = (nextData) => {
    setAppData(nextData);
    saveChatData(nextData);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const handleSignUpSubmit = (formData) => {
    const result = registerUser(formData);

    if (!result.success) {
      return result;
    }

    setCurrentUser(result.user);
    setCurrentPage("user-home");

    return result;
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    setCurrentPage("user-home");
  };
  const handleToggleRoomPermission = (roomId, permissionKey, nextValue) => {
  if (!currentUser) {
    return {
      success: false,
      message: "No current user found."
    };
  }

  const result = updateRoomPermission(
    appData,
    currentUser,
    roomId,
    permissionKey,
    nextValue
  );

  if (!result.success) {
    return result;
  }

  persistAppData(result.nextData);

  return {
    success: true,
    message: result.message
  };
};

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRoomId(null);
    setActivePrivatePartnerId(null);
    setShowChatChoiceModal(false);
    setShowCreateRoomModal(false);
    setCurrentPage("home");
  };

  const handleOpenChatChoice = () => {
    setShowChatChoiceModal(true);
  };

  const handleCloseChatChoice = () => {
    setShowChatChoiceModal(false);
  };

  const handleChoosePrivateMessaging = () => {
    setShowChatChoiceModal(false);
    setActivePrivatePartnerId(null);
    setCurrentPage("private-chat");
  };

  const handleChooseCreateRoom = () => {
    setShowChatChoiceModal(false);
    setShowCreateRoomModal(true);
  };

  const handleCloseCreateRoom = () => {
    setShowCreateRoomModal(false);
  };

  const handleCreateRoom = ({ roomName, roomIcon }) => {
  if (!currentUser) return;

  const safeRoomName = roomName.trim().slice(0, 30);

  const result = createRoom(appData, currentUser, safeRoomName, roomIcon);
  persistAppData(result.nextData);

  setCurrentRoomId(result.room.roomId);
  setShowCreateRoomModal(false);
  setCurrentPage("room-chat");
  };

  const handleOpenPrivateChatFromHistory = (otherUserId) => {
    if (!currentUser) return;

    const nextData = markPrivateChatRead(appData, currentUser.userId, otherUserId);
    persistAppData(nextData);

    setActivePrivatePartnerId(otherUserId);
    setCurrentPage("private-chat");
  };

    const handleSendPrivateMessage = (text) => {
    if (!currentUser) {
      return {
        success: false,
        message: "No current user found."
      };
    }

    if (!activePrivatePartnerId) {
      return {
        success: false,
        message: "Open a private chat first."
      };
    }

    const targetUser = getUserById(activePrivatePartnerId);

    if (!targetUser) {
      return {
        success: false,
        message: "Private chat user not found."
      };
    }

    if (targetUser.userId === currentUser.userId) {
      return {
        success: false,
        message: "You cannot send a private message to yourself."
      };
    }

    const result = createPrivateMessage(appData, currentUser, targetUser, text);
    persistAppData(result.nextData);

    return {
      success: true
    };
  };

    const handleSwitchPrivateChat = (targetInput) => {
    if (!currentUser) {
      return {
        success: false,
        message: "No current user found."
      };
    }

    const targetUser = findUserByTarget(targetInput);

    if (!targetUser) {
      return {
        success: false,
        message: "User not found by username or ID."
      };
    }

    if (targetUser.userId === currentUser.userId) {
      return {
        success: false,
        message: "You cannot open a private chat with yourself."
      };
    }

    const nextData = markPrivateChatRead(appData, currentUser.userId, targetUser.userId);
    persistAppData(nextData);

    setActivePrivatePartnerId(targetUser.userId);
    setCurrentPage("private-chat");

    return {
      success: true
    };
  };

  const handleOpenRoomFromHistory = (roomId) => {
    if (!currentUser) return;

    const nextData = markRoomRead(appData, currentUser.userId, roomId);
    persistAppData(nextData);

    setCurrentRoomId(roomId);
    setCurrentPage("room-chat");
  };

  const handleSendRoomMessage = (roomId, text) => {
    if (!currentUser) {
      return {
        success: false,
        message: "No current user found."
      };
    }

    const result = createRoomMessage(appData, currentUser, roomId, text);

    if (!result.success) {
      return result;
    }

    persistAppData(result.nextData);

    return {
      success: true,
      message: "Message sent."
    };
  };

  const handleAddMemberToRoom = (roomId, targetInput) => {
    if (!currentUser) {
      return {
        success: false,
        message: "No current user found."
      };
    }

    const targetUser = findUserByTarget(targetInput);

    if (!targetUser) {
      return {
        success: false,
        message: "User not found by username or ID."
      };
    }

    if (targetUser.userId === currentUser.userId) {
      return {
        success: false,
        message: "You are already in this room."
      };
    }

    const targetPrivacyEnabled = getUserPrivacy(appData, targetUser.userId);

    const result = addUserToRoomOrInvite(
      appData,
      currentUser,
      roomId,
      targetUser,
      targetPrivacyEnabled
    );

    if (!result.success) {
      return result;
    }

    persistAppData(result.nextData);

    return {
      success: true,
      message: result.message
    };
  };

  const handleTogglePrivacy = () => {
  if (!currentUser) return;

  const currentPrivacy = getUserPrivacy(appData, currentUser.userId);
  const nextData = setUserPrivacy(appData, currentUser.userId, !currentPrivacy);
  persistAppData(nextData);
};

const handleChangeRoomIcon = (roomId, nextIcon) => {
  if (!currentUser) {
    return {
      success: false,
      message: "No current user found."
    };
  }

  const result = updateRoomIcon(appData, currentUser, roomId, nextIcon);

  if (!result.success) {
    return result;
  }

  persistAppData(result.nextData);

  return {
    success: true,
    message: result.message
  };
};
const handleLeaveRoom = (roomId) => {
  if (!currentUser) {
    return {
      success: false,
      message: "No current user found."
    };
  }

  const result = leaveRoom(appData, currentUser, roomId);

  if (!result.success) {
    return result;
  }

  persistAppData(result.nextData);

  if (currentRoomId === roomId) {
    setCurrentRoomId(null);
    setCurrentPage("user-home");
  }

  return result;
};

const handleKickMemberFromRoom = (roomId, targetUserId) => {
  if (!currentUser) {
    return {
      success: false,
      message: "No current user found."
    };
  }

  const result = kickMemberFromRoom(appData, currentUser, roomId, targetUserId);

  if (!result.success) {
    return result;
  }

  persistAppData(result.nextData);

  return result;
};

const handleTransferRoomLeadership = (roomId, targetUserId) => {
  if (!currentUser) {
    return {
      success: false,
      message: "No current user found."
    };
  }

  const result = transferRoomLeadership(
    appData,
    currentUser,
    roomId,
    targetUserId
  );

  if (!result.success) {
    return result;
  }

  persistAppData(result.nextData);

  return result;
};
const handleChangeRoomName = (roomId, nextRoomName) => {
  if (!currentUser) {
    return {
      success: false,
      message: "No current user found."
    };
  }

  const result = updateRoomName(appData, currentUser, roomId, nextRoomName);

  if (!result.success) {
    return result;
  }

  persistAppData(result.nextData);

  return {
    success: true,
    message: result.message
  };
};

  const handleRespondInvitation = (invitationId, accept) => {
    const result = respondToInvitation(appData, invitationId, accept);

    if (!result.success) {
      return;
    }

    let nextData = result.nextData;

    if (accept && currentUser) {
      nextData = markRoomRead(nextData, currentUser.userId, result.invitation.roomId);
      persistAppData(nextData);
      setCurrentRoomId(result.invitation.roomId);
      setCurrentPage("room-chat");
      return;
    }

    persistAppData(nextData);
  };

  const handleDismissDecline = (invitationId) => {
    const nextData = dismissDeclineResult(appData, invitationId);
    persistAppData(nextData);
  };

  const currentPrivacyEnabled = currentUser
    ? getUserPrivacy(appData, currentUser.userId)
    : false;

  const activePrivateChat =
    currentUser && activePrivatePartnerId
      ? getPrivateChatBetween(appData, currentUser.userId, activePrivatePartnerId)
      : null;

  const activePrivatePartner = activePrivatePartnerId
    ? getUserById(activePrivatePartnerId)
    : null;

  const activeRoom = currentRoomId ? getRoomById(appData, currentRoomId) : null;

  return (
    <>
      {currentPage === "home" && (
        <HomePage onNavigate={setCurrentPage} onOpenLogin={openLoginModal} />
      )}

      {currentPage === "signup" && (
        <LoginForm
          onSubmitForm={handleSignUpSubmit}
          onBack={() => setCurrentPage("home")}
          onOpenLoginFromForm={() => {
            setCurrentPage("home");
            setShowLoginModal(true);
          }}
        />
      )}

      {currentPage === "user-home" && currentUser && (
        <UserHomePage
  currentUser={currentUser}
  onNavigate={setCurrentPage}
  onOpenChat={handleOpenChatChoice}
  onLogout={handleLogout}
  appData={appData}
  privacyEnabled={currentPrivacyEnabled}
  onTogglePrivacy={handleTogglePrivacy}
  onOpenPrivateChat={handleOpenPrivateChatFromHistory}
  onOpenRoom={handleOpenRoomFromHistory}
  onRespondInvitation={handleRespondInvitation}
  onDismissDecline={handleDismissDecline}
  onAvatarUpdated={setCurrentUser}
        />
      )}

      {currentPage === "about" && (
        <AboutPage onBack={() => setCurrentPage(currentUser ? "user-home" : "home")} />
      )}

      {currentPage === "contact" && (
        <ContactPage onBack={() => setCurrentPage(currentUser ? "user-home" : "home")} />
      )}

      {currentPage === "private-chat" && currentUser && (
        <ChatApp
          currentUser={currentUser}
          currentPartner={activePrivatePartner}
          chatMessages={activePrivateChat?.messages || []}
          onSend={handleSendPrivateMessage}
          onBack={() => setCurrentPage("user-home")}
          onSwitchPrivateChat={handleSwitchPrivateChat}
        />
      )}

      {currentPage === "room-chat" && currentUser && (
        <RoomChat
          currentUser={currentUser}
          room={activeRoom}
          onBack={() => setCurrentPage("user-home")}
          onSendMessage={handleSendRoomMessage}
          onAddMember={handleAddMemberToRoom}
          onChangeRoomIcon={handleChangeRoomIcon}
          onChangeRoomName={handleChangeRoomName}
          onToggleRoomPermission={handleToggleRoomPermission}
          onLeaveRoom={handleLeaveRoom}
          onKickMember={handleKickMemberFromRoom}
          onTransferLeadership={handleTransferRoomLeadership}
        />
      )}

      {showLoginModal && (
        <LoginModal onClose={closeLoginModal} onLoginSuccess={handleLoginSuccess} />
      )}

      {showChatChoiceModal && (
        <ChatChoiceModal
          onClose={handleCloseChatChoice}
          onPrivateMessaging={handleChoosePrivateMessaging}
          onCreateRoom={handleChooseCreateRoom}
        />
      )}

      {showCreateRoomModal && (
        <CreateRoomModal
          onClose={handleCloseCreateRoom}
          onCreateRoom={handleCreateRoom}
        />
      )}
    </>
  );
}

export default App;