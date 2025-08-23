import { useEffect, useState } from "react";
import socket from "../utils/socket";

const ChatSection = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ id: string; message: string }[]>(
    []
  );

  useEffect(() => {
    socket.on("chat-message", (msg) => {
      console.log({ msg });

      setMessages((prevMessages) => [...prevMessages, msg]); // Add new messages
    });

    return () => {
      socket.off("chat-message"); // Clean up the listener
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const msg = { id: socket.id, message };
      socket.emit("chat-message", msg); // Send message with username to server
      setMessage(""); // Clear message input
    }
  };

  return (
    <div className="flex-1">
      <header className="bg-white p-4 text-gray-700">
        <h1 className="text-2xl font-semibold">Alice</h1>
      </header>

      <div className="h-screen overflow-y-auto p-4 pb-36">
        {messages.map((msg, index) => {
          return socket.id !== msg.id ? (
            <div className="flex mb-4 cursor-pointer">
              <div className="w-9 h-9 rounded-full flex items-center justify-center mr-2">
                <img
                  src="https://placehold.co/200x/ffa8e4/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full"
                />
              </div>
              <div className="flex max-w-96 bg-white rounded-lg p-3 gap-3">
                <p className="text-gray-700">{msg.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-end mb-4 cursor-pointer">
              <div className="flex max-w-96 bg-indigo-500 text-white rounded-lg p-3 gap-3">
                <p>{msg.message}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center ml-2">
                <img
                  src="https://placehold.co/200x/b7a8ff/ffffff.svg?text=ʕ•́ᴥ•̀ʔ&font=Lato"
                  alt="My Avatar"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
          );
        })}
      </div>

      <footer className="bg-white border-t border-gray-300 p-4 absolute bottom-0 w-3/4">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyUp={(e) => {
              if (e.code == "Enter") {
                sendMessage();
              }
            }}
            className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatSection;
