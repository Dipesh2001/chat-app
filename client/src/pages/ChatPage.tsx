import { useNavigate, useParams } from "react-router-dom";
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
import { useEffect, useState } from "react";
import { useLazyFetchRoomQuery } from "../features/roomApi";
import type { Room } from "../app/types";

const ChatPage = () => {
  const [logoutAdmin] = useLogoutUserMutation();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>();
  const { data: userData, isLoading, error } = useValidateUserQuery();
  const [fetchRoom, { data: selectedData }] = useLazyFetchRoomQuery();
  const { roomId } = useParams();

  useEffect(() => {
    fetchRoom(selectedRoom?._id || "");
  }, [selectedRoom?._id]);

  useEffect(() => {
    fetchRoom(roomId || "");
  }, [roomId]);

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
        onRoomSelect={setSelectedRoom}
        selectedRoomId={selectedRoom?._id}
      />
      <EnhancedChatSection
        currentUser={userData?.user}
        selectedRoom={selectedData?.room || selectedRoom}
      />
    </div>
  );
};

export default ChatPage;
