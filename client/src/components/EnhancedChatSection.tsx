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
import DateSeparator from "./DateSeparator";
import { socket } from "../utils/socket";
import type { Message, Room, User } from "../app/types";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { formatLastSeen } from "../helper";
import {
  useLazyFetchMessagesQuery,
  useUpdateMessageStatusMutation,
} from "../features/messageApi";
import SystemMessage from "./SystemMessage";
import type { UserStatusState } from "../features/userStatusSlice";

interface EnhancedChatSectionProps {
  selectedRoom?: Room;
  currentUser?: User | null;
}

interface groupMessageType {
  _id: string; // date string (YYYY-MM-DD)
  messages: Message[];
}

const EnhancedChatSection = ({
  selectedRoom,
  currentUser,
}: EnhancedChatSectionProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<groupMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const listRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [fetchMessages, { isFetching }] = useLazyFetchMessagesQuery();
  const [updateMessageStatus] = useUpdateMessageStatusMutation();

  const status = useSelector((state: RootState) => state.userStatus);

  const memberData = selectedRoom?.members.filter(
    (el: any) => el?._id !== currentUser?._id
  );
  const roomName =
    selectedRoom?.type === "direct" ? memberData?.[0]?.name : "Unknown";
  const roomAvatar =
    selectedRoom?.type === "direct" ? memberData?.[0]?.profileImage : "Unknown";

  // 🔹 Reset messages when room changes
  useEffect(() => {
    setMessages([]);
    setPage(1);
  }, [selectedRoom]);

  // 🔹 Fetch grouped messages with pagination
  useEffect(() => {
    if (!selectedRoom) return;

    const chatContainer = listRef.current;
    const prevScrollHeight = chatContainer?.scrollHeight || 0;
    const prevScrollTop = chatContainer?.scrollTop || 0;

    fetchMessages({ page, size: 3, roomId: selectedRoom._id })
      .unwrap()
      .then((res) => {
        if (!res?.messages) return;

        // Reverse inner messages for ascending order
        const normalized = res.messages.map((group) => ({
          ...group,
          messages: [...group.messages].reverse(),
        }));

        // Merge new and old grouped messages
        setMessages((prev) => {
          const merged = [...normalized, ...prev].reduce(
            (acc: groupMessageType[], curr) => {
              const existing = acc.find((g) => g._id === curr._id);
              if (existing) {
                const existingIds = new Set(
                  existing.messages.map((m) => m._id)
                );
                const newMsgs = curr.messages.filter(
                  (m) => !existingIds.has(m._id)
                );
                existing.messages = [...newMsgs, ...existing.messages];
              } else {
                acc.push(curr);
              }
              return acc;
            },
            []
          );
          return merged.sort((a, b) => a._id.localeCompare(b._id));
        });

        setHasMore(
          (res.pagination?.page || 1) * (res.pagination?.size || 0) <
            (res.pagination?.totalItems || 0)
        );

        // Maintain scroll position
        requestAnimationFrame(() => {
          if (!chatContainer) return;
          const newScrollHeight = chatContainer.scrollHeight;
          chatContainer.scrollTop =
            newScrollHeight - prevScrollHeight + prevScrollTop;
        });
      });
  }, [selectedRoom, page]);

  // 🔹 Socket setup for typing + message events
  useEffect(() => {
    if (!selectedRoom || !socket) return;

    socket.emit("join-room", selectedRoom._id);

    // ✅ Handle new incoming message (real-time)
    const handleMessage = (msg: Message) => {
      // Determine date group (YYYY-MM-DD)
      const dateKey = msg?.updatedAt
        ? new Date().toISOString().split("T")[0]
        : "Today";

      setMessages((prev) => {
        const existingGroup = prev.find((g) => g._id === dateKey);
        if (existingGroup) {
          // Avoid duplicates
          if (existingGroup.messages.some((m) => m._id === msg._id))
            return prev;

          const updatedGroups = prev.map((group) =>
            group._id === dateKey
              ? { ...group, messages: [...group.messages, msg] }
              : group
          );
          return updatedGroups;
        } else {
          // Add new date group
          return [...prev, { _id: dateKey, messages: [msg] }].sort((a, b) =>
            a._id.localeCompare(b._id)
          );
        }
      });

      // Scroll to bottom if new message is from current room
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    };

    const handleDelivered = (msg: Message) => {
      // Update UI immediately
      setMessages((prev) =>
        prev.map((group) => ({
          ...group,
          messages: group.messages.map((m) =>
            m._id === msg._id ? { ...m, status: "delivered" } : m
          ),
        }))
      );
    };

    const handleMessageSeen = (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((group) => ({
          ...group,
          messages: group.messages.map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          ),
        }))
      );
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("chat-message", handleMessage);
    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    socket.on("message-delivered", handleDelivered);
    socket?.on("message-seen", handleMessageSeen);

    return () => {
      socket?.emit("leave-room", selectedRoom._id);
      socket?.off("chat-message", handleMessage);
      socket?.off("user-typing", handleTyping);
      socket?.off("user-stop-typing", handleStopTyping);
      socket?.off("message-delivered", handleDelivered);
      socket?.off("message-seen", handleMessageSeen);
    };
  }, [selectedRoom]);

  const markMessageAsSeen = (messageId: string) => {
    if (!selectedRoom) return;
    socket?.emit("message-read", { messageId, userId: currentUser?._id });
  };

  useEffect(() => {
    if (!selectedRoom || !socket || !currentUser) return;
    messages.forEach((group) => {
      group.messages.forEach((msg) => {
        if (msg.senderId !== currentUser._id && msg.status === "sent") {
          socket?.emit("message-received", {
            messageId: msg._id,
            userId: currentUser._id,
          });
          markMessageAsSeen(String(msg._id));
        }
        // else if (
        //   msg.senderId !== currentUser._id &&
        //   msg.status === "delivered"
        // ) {
        //   markMessageAsSeen(String(msg._id));
        // }
      });
    });
  }, [messages, selectedRoom]);

  // 🔹 Send message
  const sendMessage = () => {
    if (message.trim() && selectedRoom) {
      const msg = {
        _id: `${Date.now()}`, // temporary id for UI
        content: message.trim(),
        roomId: selectedRoom._id,
        senderId: currentUser?._id,
        senderName: currentUser?.name,
        senderAvatar: currentUser?.profileImage,
        status: "sent",
        type: "text",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      socket?.emit("chat-message", msg);
      socket?.emit("stop-typing", selectedRoom._id);
      setMessage("");
    }
  };

  // 🔹 Typing events
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (!selectedRoom || !socket) return;
    socket.emit("typing", selectedRoom._id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stop-typing", selectedRoom._id);
    }, 1500);
  };

  // 🔹 Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🔹 Infinite scroll
  const handleScroll = () => {
    const el = listRef.current;
    if (!el || isFetching || !hasMore) return;
    if (el.scrollTop === 0) {
      setPage((p) => p + 1);
    }
  };

  // 🔹 No room selected
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

  // 🔹 Main chat UI
  return (
    <div className="flex-1 flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border bg-chat-header flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={roomAvatar}
              alt={roomName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {selectedRoom.type === "direct" &&
              memberData?.[0] &&
              status[memberData?.[0]?._id]?.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-status-online border-2 border-background rounded-full"></div>
              )}
          </div>
          <div>
            <h2 className="font-semibold text-foreground">{roomName}</h2>
            <p className="text-xs text-muted-foreground">
              {selectedRoom.type === "direct" &&
              memberData?.[0] &&
              status[memberData?.[0]?._id]?.isOnline
                ? "Online"
                : formatLastSeen(memberData?.[0]?.lastSeen || "")}
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

      {/* Messages */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.map((group) => (
          <div key={group._id}>
            <DateSeparator date={new Date(group._id)} />
            {group.messages.map((msg) =>
              msg?.type === "system" ? (
                <SystemMessage
                  key={msg._id}
                  content={msg.content}
                  timestamp={new Date(String(msg.updatedAt))}
                />
              ) : (
                <MessageBubble
                  key={msg._id}
                  message={msg}
                  isOwn={msg.senderId === currentUser?._id}
                />
              )
            )}
          </div>
        ))}

        {isTyping && <TypingIndicator avatar={roomAvatar} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
              onChange={handleTyping}
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
