import { useNavigate } from "react-router-dom";
import ChatSection from "../components/ChatSection";
import EnhancedChatSection from "../components/EnhancedChatSection";
import EnhancedSidebar from "../components/EnhancedSidebar";
import Sidebar from "../components/Sidebar";
import { successToast } from "../helper";
import { disconnectSocket } from "../utils/socket";
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
  const { data: userData, isLoading, error } = useValidateUserQuery();
  return (
    // <div className="flex h-screen overflow-hidden">
    //   <Sidebar />
    //   <ChatSection />
    // </div>

    <div className="flex h-screen overflow-hidden bg-background">
      <EnhancedSidebar
        currentUser={userData?.user}
        onLogout={async () => {
          const { error } = await logoutAdmin();
          disconnectSocket();
          if (!error) {
            successToast("Logged out successfully.");
            navigate("/login");
          }
        }}
        // onRoomSelect={setSelectedRoom}
        // selectedRoomId={selectedRoom?.id}
      />
      {/* <EnhancedChatSection selectedRoom={selectedRoom} /> */}
    </div>
  );
};

export default ChatPage;
