import { useEffect, useRef, useState } from "react";
import { X, Users, Hash, MessageCircle, Upload, Search } from "lucide-react";
import { useLazyFetchUsersQuery } from "../features/userApi";
import type { User } from "../app/types";

interface CreateRoomModalProps {
  onClose: () => void;
}

const CreateRoomModal = ({ onClose }: CreateRoomModalProps) => {
  const [roomType, setRoomType] = useState<"direct" | "group" | "channel">(
    "direct"
  );
  const [roomName, setRoomName] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchUsers, { isFetching }] = useLazyFetchUsersQuery();

  const handleCreate = () => {
    // Handle room creation logic here
    console.log("Creating room:", {
      roomType,
      roomName,
      description,
      isPrivate,
      selectedUsers,
    });

    onClose();
  };

  // useEffect(() => {
  //   fetchUsers({ page: 1, size: 6, search: searchQuery });
  // }, [fetchUsers, searchQuery]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users when page/search changes
  useEffect(() => {
    fetchUsers({ page, size: 6, search: searchQuery })
      .unwrap()
      .then((res) => {
        setUsers((prev) => {
          let updatedList = [...prev, ...res.users];
          setHasMore(
            updatedList?.length === res.pagination?.totalItems ? false : true
          );
          return updatedList;
        });
      });
  }, [fetchUsers, page, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || isFetching || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      setPage((p) => p + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">Create New Chat</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Room Type Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">Chat Type</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRoomType("direct")}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  roomType === "direct"
                    ? "border-chat-primary bg-chat-primary/10 text-chat-primary"
                    : "border-border hover:border-chat-primary/50"
                }`}
              >
                <MessageCircle className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Direct</span>
              </button>
              {/* <button
                onClick={() => setRoomType("group")}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  roomType === "group"
                    ? "border-chat-primary bg-chat-primary/10 text-chat-primary"
                    : "border-border hover:border-chat-primary/50"
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Group</span>
              </button>
              <button
                onClick={() => setRoomType("channel")}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  roomType === "channel"
                    ? "border-chat-primary bg-chat-primary/10 text-chat-primary"
                    : "border-border hover:border-chat-primary/50"
                }`}
              >
                <Hash className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Channel</span>
              </button> */}
            </div>
          </div>

          {/* Room Name */}
          {roomType !== "direct" && (
            <div>
              <label
                htmlFor="roomName"
                className="text-sm font-medium mb-2 block"
              >
                {roomType === "group" ? "Group Name" : "Channel Name"}
              </label>
              <input
                id="roomName"
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder={`Enter ${roomType} name...`}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chat-primary bg-background"
              />
            </div>
          )}

          {/* Description */}
          {roomType !== "direct" && (
            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium mb-2 block"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this chat about?"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chat-primary bg-background resize-none"
              />
            </div>
          )}

          {/* Privacy Toggle */}
          {roomType !== "direct" && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Private {roomType}</p>
                <p className="text-xs text-muted-foreground">
                  Only invited members can join
                </p>
              </div>
              <button
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isPrivate ? "bg-chat-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isPrivate ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          )}
          {/* Search */}
          <div className="border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder={`Search...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-chat-primary"
              />
            </div>
          </div>

          {/* User Selection */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {roomType === "direct" ? "Select User" : "Add Members"}
            </label>
            <div
              ref={listRef}
              onScroll={handleScroll}
              className="space-y-2 max-h-40 overflow-y-auto"
            >
              {users?.map((user: User) => (
                <label
                  key={user._id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                >
                  <input
                    type={roomType === "direct" ? "radio" : "checkbox"}
                    name={roomType === "direct" ? "selectedUser" : undefined}
                    checked={selectedUsers.includes(user._id)}
                    onChange={(e) => {
                      if (roomType === "direct") {
                        setSelectedUsers(e.target.checked ? [user._id] : []);
                      } else {
                        setSelectedUsers((prev) =>
                          e.target.checked
                            ? [...prev, user._id]
                            : prev.filter((id) => id !== user._id)
                        );
                      }
                    }}
                    className="w-4 h-4 text-chat-primary rounded focus:ring-chat-primary"
                  />
                  <img
                    src={
                      user?.profileImage
                        ? user?.profileImage
                        : `https://placehold.co/200x/87ceeb/ffffff.svg?text=${user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}&font=Lato`
                    }
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={
              roomType !== "direct"
                ? !roomName.trim()
                : selectedUsers.length === 0
            }
            className="px-4 py-2 bg-chat-primary hover:bg-chat-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Start{" "}
            {roomType === "group"
              ? "Group"
              : roomType === "channel"
              ? "Channel"
              : "Chat"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomModal;
