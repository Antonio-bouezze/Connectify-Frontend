import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

function ChatApp({
  currentUser,
  currentPartner,
  chatMessages,
  onSend,
  onBack,
  onSwitchPrivateChat
}) {
  const handleSendMessage = (text) => {
    return onSend(text);
  };

  return (
    <div className="app-container private-chat-page">
      <ChatWindow
        currentUser={currentUser}
        currentPartner={currentPartner}
        messages={chatMessages}
        onSwitchPrivateChat={onSwitchPrivateChat}
        onBack={onBack}
      />

      <MessageInput
        onSend={handleSendMessage}
        disabled={!currentPartner}
      />
    </div>
  );
}

export default ChatApp;