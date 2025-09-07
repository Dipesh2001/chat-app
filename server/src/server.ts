// server.ts
import express, { Request, Response } from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import userRoutes from "./routes/user-routes";
import roomRoutes from "./routes/room-routes";
import { errorHandler } from "./middleware/error-handler";
import cors from "cors";
import { connectDB } from "./config/db";
import cookieParser from "cookie-parser";
import { User } from "./models/user-model";
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/api/user", userRoutes);
app.use("/api/room", roomRoutes);
app.use("/uploads", express.static("uploads"));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express");
});
// app.use(errorHandler);

const io = new Server(server, {
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
const onlineUsers = new Map<string, string>();
// Handling client connections
io.on("connection", async (socket: Socket) => {
  const userIdValue = socket.handshake.query.userId || "";
  const userId = userIdValue || userIdValue[0];
  if (userId) {
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true }).exec();
    socket.broadcast.emit("user:online", { userId });
    socket.emit("users:online-list", { users: Array.from(onlineUsers.keys()) });
  }

  // Chat message event
  socket.on("chat-message", (msg: string) => {
    io.emit("chat-message", msg); // Broadcast to all clients
  });

  // Disconnect event
  socket.on("disconnect", async () => {
    console.log("user disconnected:", socket.id);
    if (userId) {
      onlineUsers.delete(userId);
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
