import Login from "../pages/Login";
import ChatPage from "../pages/ChatPage";

export const publicRoutes = [{ path: "/login", element: <Login /> }];
export const protectedRoutes = [
  { path: "/", element: <ChatPage /> },
  { path: "/:roomId", element: <ChatPage /> },
];
