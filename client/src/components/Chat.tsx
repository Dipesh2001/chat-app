import React, { useState, useEffect } from "react";
import socket from "../utils/socket";

const Chat: React.FC = () => {
  const [username, setUsername] = useState(""); // Track the username
  const [message, setMessage] = useState(""); // Track the chat message
  const [messages, setMessages] = useState<{ username: string; message: string }[]>([]); // Track messages with usernames
  const [isJoined, setIsJoined] = useState(false); // Flag to check if user has joined the chat

  // Listen for incoming messages
  useEffect(() => {
    socket.on("chat-message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]); // Add new messages
    });

    return () => {
      socket.off("chat-message"); // Clean up the listener
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() && username.trim()) {
      const msg = { username, message };
      socket.emit("chat-message", msg); // Send message with username to server
      setMessage(""); // Clear message input
    }
  };

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setIsJoined(true); // Mark user as joined
    }
  };

  return (
    <div>
      {/* Show username prompt before chat */}
      {!isJoined ? (
        <div>
          <h2>Enter your username:</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <button onClick={handleUsernameSubmit}>Join Chat</button>
        </div>
      ) : (
        <div>
          <h2>Group Chat</h2>
          <div>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>
                  <strong>{msg.username}:</strong> {msg.message}
                </li>
              ))}
            </ul>
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
};

export default Chat;
