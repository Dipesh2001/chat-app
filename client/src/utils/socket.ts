// src/utils/socket.ts
import { io, Socket } from "socket.io-client";
import { store } from "../app/store";
import { setUserOffline, setUserOnline } from "../features/userStatusSlice";

export let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (socket) return socket; // already connected

  socket = io("http://localhost:4000", {
    query: { userId },
  });

  socket.on("user:online", ({ userId }) => {
    store.dispatch(setUserOnline(userId));
  });

  socket.on("user:offline", ({ userId, lastSeen }) => {
    store.dispatch(setUserOffline({ userId, lastSeen }));
  });

  socket.on("users:online-list", ({ users }) => {
    users.forEach((userId: string) => {
      store.dispatch(setUserOnline(userId));
    });
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
