import { useState } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Users,
  Settings,
  LogOut,
  MessageCircle,
  Hash,
  Phone,
  Video,
  Star,
} from "lucide-react";
import CreateRoomModal from "./CreateRoomModal";
import UserSearchModal from "./UserSearchModal";
import type { User } from "../app/types";

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

interface EnhancedSidebarProps {
  currentUser: User | undefined;
  onLogout: () => void;
  onRoomSelect: (room: Room) => void;
  selectedRoomId?: string;
}

const EnhancedSidebar = ({
  currentUser,
  onLogout,
  onRoomSelect,
  selectedRoomId,
}: EnhancedSidebarProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with real data
  const rooms: Room[] = [
    {
      id: "1",
      name: "Alice Johnson",
      type: "direct",
      avatar: "https://placehold.co/200x/ffa8e4/ffffff.svg?text=AJ&font=Lato",
      lastMessage: "Hey there! How are you?",
      lastSeen: "2 min ago",
      unreadCount: 3,
      isOnline: true,
    },
    {
      id: "2",
      name: "Development Team",
      type: "group",
      avatar: "https://placehold.co/200x/b7a8ff/ffffff.svg?text=DT&font=Lato",
      lastMessage: "The new feature is ready",
      lastSeen: "10 min ago",
      unreadCount: 1,
      members: ["Alice", "Bob", "Charlie"],
    },
    {
      id: "3",
      name: "general",
      type: "channel",
      avatar: "https://placehold.co/200x/87ceeb/ffffff.svg?text=G&font=Lato",
      lastMessage: "Welcome everyone!",
      lastSeen: "1 hour ago",
      unreadCount: 0,
    },
  ];

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomIcon = (type: string) => {
    switch (type) {
      case "direct":
        return <MessageCircle className="w-4 h-4" />;
      case "group":
        return <Users className="w-4 h-4" />;
      case "channel":
        return <Hash className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="w-80 bg-chat-sidebar border-r border-border flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-border bg-chat-header">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-chat-primary to-chat-secondary bg-clip-text text-transparent">
              ChatApp
            </h1>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <img
                  src={currentUser?.profileImage}
                  alt={currentUser?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* User Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-border">
                    <p className="font-medium text-sm">{currentUser?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {currentUser?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Starred Messages
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chat-primary"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-b border-border">
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 bg-chat-primary hover:bg-chat-primary/90 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
            <button
              onClick={() => setShowUserSearch(true)}
              className="bg-chat-secondary hover:bg-chat-secondary/90 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => onRoomSelect(room)}
              className={`p-3 border-b border-border hover:bg-accent cursor-pointer transition-colors ${
                selectedRoomId === room.id ? "bg-accent" : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={room.avatar}
                    alt={room.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {room.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-status-online border-2 border-background rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    {getRoomIcon(room.type)}
                    <p className="font-medium text-sm truncate">{room.name}</p>
                    {room.unreadCount && room.unreadCount > 0 && (
                      <span className="bg-chat-primary text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {room.lastMessage}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {room.lastSeen}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border">
          <div className="flex justify-around">
            <button className="p-3 rounded-lg hover:bg-accent transition-colors">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-3 rounded-lg hover:bg-accent transition-colors">
              <Video className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-3 rounded-lg hover:bg-accent transition-colors">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
      {showUserSearch && (
        <UserSearchModal onClose={() => setShowUserSearch(false)} />
      )}
    </>
  );
};

export default EnhancedSidebar;
