import { useState } from "react";
import {
  X,
  Search,
  UserPlus,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";

interface UserSearchModalProps {
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  isOnline: boolean;
  isFriend: boolean;
  isBlocked: boolean;
  avatar: string;
}

const UserSearchModal = ({ onClose }: UserSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"search" | "friends" | "blocked">(
    "search"
  );

  // Mock users
  const allUsers: User[] = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      isOnline: true,
      isFriend: true,
      isBlocked: false,
      avatar: "https://placehold.co/200x/ffa8e4/ffffff.svg?text=AJ&font=Lato",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      isOnline: false,
      isFriend: false,
      isBlocked: false,
      avatar: "https://placehold.co/200x/b7a8ff/ffffff.svg?text=BS&font=Lato",
    },
    {
      id: "3",
      name: "Charlie Brown",
      email: "charlie@example.com",
      isOnline: true,
      isFriend: false,
      isBlocked: true,
      avatar: "https://placehold.co/200x/87ceeb/ffffff.svg?text=CB&font=Lato",
    },
  ];

  const getFilteredUsers = () => {
    let users = allUsers;

    if (activeTab === "friends") {
      users = users.filter((user) => user.isFriend);
    } else if (activeTab === "blocked") {
      users = users.filter((user) => user.isBlocked);
    }

    if (searchQuery) {
      users = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return users;
  };

  const handleAction = (
    userId: string,
    action: "message" | "add" | "unblock" | "block"
  ) => {
    console.log(`Action ${action} on user ${userId}`);
    // Handle actions here
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-lg mx-4 shadow-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Find People</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { key: "search", label: "Search" },
            { key: "friends", label: "Friends" },
            { key: "blocked", label: "Blocked" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-chat-primary border-b-2 border-chat-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chat-primary"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {getFilteredUsers().map((user) => (
            <div
              key={user.id}
              className="p-4 border-b border-border hover:bg-accent transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {user.isOnline && !user.isBlocked && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-status-online border-2 border-background rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                  {user.isBlocked && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                      Blocked
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {user.isBlocked ? (
                    <button
                      onClick={() => handleAction(user.id, "unblock")}
                      className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      Unblock
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAction(user.id, "message")}
                        className="p-2 text-chat-primary hover:bg-chat-primary/10 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      {!user.isFriend && (
                        <button
                          onClick={() => handleAction(user.id, "add")}
                          className="p-2 text-chat-secondary hover:bg-chat-secondary/10 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}
                      <div className="relative group">
                        <button className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <button
                            onClick={() => handleAction(user.id, "block")}
                            className="w-full px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            Block User
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {getFilteredUsers().length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;
