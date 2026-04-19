import { useRef, useState } from "react";

function MessageInput({ onSend, disabled = false }) {
  const [message, setMessage] = useState("");
  const privateTextareaRef = useRef(null);

  const resetTextarea = () => {
    if (privateTextareaRef.current) {
      privateTextareaRef.current.style.height = "56px";
      privateTextareaRef.current.style.overflowY = "hidden";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (disabled || !message.trim()) return;

    const result = onSend(message.trim());

    if (!result?.success) return;

    setMessage("");
    resetTextarea();
  };

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <textarea
        ref={privateTextareaRef}
        className="private-message-input"
        placeholder={disabled ? "Open a private chat first..." : "Type a message...!"}
        value={message}
        rows={1}
        disabled={disabled}
        onChange={(e) => {
          setMessage(e.target.value);
          e.target.style.height = "56px";

          const newHeight = Math.min(e.target.scrollHeight, 112);
          e.target.style.height = `${newHeight}px`;

          if (e.target.scrollHeight > 112) {
            e.target.style.overflowY = "auto";
          } else {
            e.target.style.overflowY = "hidden";
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />

      <button type="submit" disabled={disabled}>
        Send
      </button>
    </form>
  );
}

export default MessageInput;