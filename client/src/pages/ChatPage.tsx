import ChatSection from "../components/ChatSection";
import Sidebar from "../components/Sidebar";
import socket from "../utils/socket";

const ChatPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ChatSection />
    </div>
  )
}

export default ChatPage;