// server.ts
import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import userRoutes from "./routes/user-routes";
import roomRoutes from "./routes/room-routes";
import messageRoutes from "./routes/message-routes";
import { errorHandler } from "./middleware/error-handler";
import cors from "cors";
import { connectDB } from "./config/db";
import cookieParser from "cookie-parser";
import { User } from "./models/user-model";
import { Message } from "./models/message-model";
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/message", messageRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express");
});
// app.use(errorHandler);

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true, // 🔑 allow cookies
  },
});

function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
export const onlineUsers = new Map<string, string>();
// Handling client connections
io.on("connection", async (socket: Socket) => {
  console.log("connection connected");
  const userIdValue = socket.handshake.query.userId || "";
  const userNameValue = socket.handshake.query.userName || "";
  const userAvatarValue = socket.handshake.query.userAvatar || "";
  const userId = userIdValue || userIdValue[0];
  const userName = userNameValue || userNameValue[0];
  const userAvatar = userAvatarValue || userAvatarValue[0];

  if (userId) {
    onlineUsers.set(Array.isArray(userId) ? userId[0] : userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true }).exec();
    socket.broadcast.emit("user:online", { userId });
    socket.emit("users:online-list", { users: Array.from(onlineUsers.keys()) });
  }

  socket.on("join-room", (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined ${roomId}`);
  });

  socket.on("leave-room", (roomId: string) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left ${roomId}`);
  });

  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("user-typing");
  });

  socket.on("room-created", (roomId) => {
    io.to(roomId).emit("room-created");
  });

  socket.on("stop-typing", (roomId) => {
    socket.to(roomId).emit("user-stop-typing");
  });

  socket.on("chat-message", async (data) => {
    try {
      // destructure from client payload
      const { message, roomId, timestamp } = data;

      // Map client fields -> DB fields
      const messageData = await Message.create({
        roomId,
        senderId: userId, // from socket handshake
        senderName: userName || "Unknown", // or fetch from DB
        content: message, // rename "message" -> "content"
        senderAvatar: userAvatar,
        type: "text",
        status: "sent",
        timestamp, // optional, mongoose will auto-set createdAt
      });

      // Emit the saved message to room
      io.to(roomId).emit("chat-message", messageData);
      // io.emit("chat-message", data);
    } catch (err) {
      console.error("Error saving message:", err);
      // socket.emit("error", "Message not saved");
    }
  });

  // Disconnect event
  socket.on("disconnect", async () => {
    console.log("user disconnected:", socket.id);
    if (userId) {
      onlineUsers.delete(Array.isArray(userId) ? userId[0] : userId);
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      }).exec();

      socket.broadcast.emit("user:offline", {
        userId,
        lastSeen: new Date(),
      });
    }
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
