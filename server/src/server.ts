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
    origin: "*",
  },
});

// Handling client connections
io.on("connection", (socket: Socket) => {
  console.log("a user connected:", socket.id);

  // Chat message event
  socket.on("chat-message", (msg: string) => {
    io.emit("chat-message", msg); // Broadcast to all clients
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
