// src/utils/socket.ts
import { io, Socket } from "socket.io-client";
import { store } from "../app/store";
import { resetStatuses, setUserOffline, setUserOnline } from "../features/userStatusSlice";

export let socket: Socket | null = null;

export const initSocket = (currentUserId: string) => {
  if ((socket && socket.connected) || !currentUserId) return socket; // already connected

  socket = io("http://localhost:4000", {
    autoConnect: true,
    query: { userId: currentUserId },
    transports: ["websocket"], // force websocket for reliability
  });

  socket.on("connect", () => {
    console.log("Connected with socket id:", socket?.id);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  socket.on("user:offline", ({ userId, lastSeen }) => {
    if (userId === currentUserId) return; // 
    console.log("user went offline:", userId, lastSeen);
    store.dispatch(setUserOffline({ userId, lastSeen }));
  });

  socket.on("user:online", ({ userId }) => {
    if (userId === currentUserId) return;
    console.log("user came online:", userId);
    store.dispatch(setUserOnline(userId));
  });

  socket.on("users:online-list", ({ users }) => {
    console.log("online users:", users);
    users.filter((id: string) => id !== currentUserId).forEach((id: string) => {
      store.dispatch(setUserOnline(id));
    });
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    store.dispatch(resetStatuses())
    socket = null;
  }
};