import { useState, useEffect, useRef } from "react";
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  Mic,
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypeIndicator";
import { socket } from "../utils/socket";

interface Room {
  id: string;
  name: string;
  type: "direct" | "group" | "channel";
  avatar?: string;
  lastMessage?: string;
  lastSeen?: string;
  unreadCount?: number;
  isOnline?: boolean;
  members?: string[];
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image" | "file" | "audio";
}

interface EnhancedChatSectionProps {
  selectedRoom?: Room;
}

const EnhancedChatSection = ({ selectedRoom }: EnhancedChatSectionProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket?.on("chat-message", (msg) => {
      const newMessage: Message = {
        id: msg.id + Date.now(),
        senderId: msg.id,
        senderName:
          msg.id === socket?.id ? "You" : selectedRoom?.name || "User",
        senderAvatar:
          msg.id === socket?.id
            ? "https://placehold.co/200x/b7a8ff/ffffff.svg?text=ME&font=Lato"
            : selectedRoom?.avatar ||
              "https://placehold.co/200x/ffa8e4/ffffff.svg?text=U&font=Lato",
        content: msg.message,
        timestamp: new Date(),
        status: msg.id === socket?.id ? "sent" : "delivered",
        type: "text",
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket?.off("chat-message");
    };
  }, [selectedRoom]);

  const sendMessage = () => {
    if (message.trim() && selectedRoom) {
      const msg = {
        id: socket?.id,
        message: message.trim(),
        roomId: selectedRoom.id,
        timestamp: new Date().toISOString(),
      };
      socket?.emit("chat-message", msg);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Smile className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No chat selected</h3>
          <p className="text-muted-foreground">
            Choose a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-chat-header flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={selectedRoom.avatar}
              alt={selectedRoom.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {selectedRoom.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-online border-2 border-background rounded-full"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">
              {selectedRoom.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedRoom.isOnline
                ? "Online"
                : `Last seen ${selectedRoom.lastSeen}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowRoomMenu(!showRoomMenu)}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showRoomMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent">
                    View Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent">
                    Media & Files
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent">
                    Search Messages
                  </button>
                  <hr className="my-2 border-border" />
                  <button className="w-full px-4 py-2 text-left text-sm hover:bg-accent text-destructive">
                    Block User
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === socket?.id}
          />
        ))}

        {isTyping && <TypingIndicator avatar={selectedRoom.avatar} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-chat-header">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 bg-background border border-border rounded-lg">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent border-0 focus:outline-none resize-none max-h-32"
              style={{ minHeight: "44px" }}
            />
          </div>
          <div className="flex space-x-1">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="p-2 bg-chat-primary hover:bg-chat-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatSection;
