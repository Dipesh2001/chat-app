import { Check, CheckCheck } from "lucide-react";
import { cn } from "../lib/utils";

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

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case "sending":
        return (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        );
      case "sent":
        return <Check className="w-4 h-4" />;
      case "delivered":
        return <CheckCheck className="w-4 h-4" />;
      case "read":
        return <CheckCheck className="w-4 h-4 text-chat-primary" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };

  if (isOwn) {
    return (
      <div className="flex justify-end items-end space-x-2">
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-chat-bubble-sent text-white px-4 py-2 rounded-2xl rounded-br-md shadow-sm">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            <div className="text-muted-foreground">{getStatusIcon()}</div>
          </div>
        </div>
        <img
          src={message.senderAvatar}
          alt={message.senderName}
          className="w-8 h-8 rounded-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex items-end space-x-2">
      <img
        src={message.senderAvatar}
        alt={message.senderName}
        className="w-8 h-8 rounded-full object-cover"
      />
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-chat-bubble-received border border-chat-bubble-received-border px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
          <p className="text-sm leading-relaxed text-foreground">
            {message.content}
          </p>
        </div>
        <div className="flex items-center mt-1">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
