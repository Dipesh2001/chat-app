import { useNavigate } from "react-router-dom";
import ChatSection from "../components/ChatSection";
import EnhancedChatSection from "../components/EnhancedChatSection";
import EnhancedSidebar from "../components/EnhancedSidebar";
import Sidebar from "../components/Sidebar";
import { successToast } from "../helper";
import socket from "../utils/socket";
import {
  useLogoutUserMutation,
  useValidateUserQuery,
} from "../features/userApi";
import { useState } from "react";

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

const ChatPage = () => {
  const [logoutAdmin] = useLogoutUserMutation();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>();
  const { data, isLoading, error } = useValidateUserQuery();
  // Mock current user - replace with real user data
  const currentUser = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    profileImage:
      "https://placehold.co/200x/b7a8ff/ffffff.svg?text=JD&font=Lato",
  };
  return (
    // <div className="flex h-screen overflow-hidden">
    //   <Sidebar />
    //   <ChatSection />
    // </div>

    <div className="flex h-screen overflow-hidden bg-background">
      <EnhancedSidebar
        currentUser={data?.user}
        onLogout={async () => {
          const { error } = await logoutAdmin();
          if (!error) {
            successToast("Logged out successfully.");
            navigate("/login");
          }
        }}
        onRoomSelect={setSelectedRoom}
        selectedRoomId={selectedRoom?.id}
      />
      <EnhancedChatSection selectedRoom={selectedRoom} />
    </div>
  );
};

export default ChatPage;
