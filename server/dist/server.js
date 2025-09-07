"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const user_routes_1 = __importDefault(require("./routes/user-routes"));
const room_routes_1 = __importDefault(require("./routes/room-routes"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_model_1 = require("./models/user-model");
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)({ origin: "http://localhost:5173", credentials: true }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/api/user", user_routes_1.default);
app.use("/api/room", room_routes_1.default);
app.use("/uploads", express_1.default.static("uploads"));
app.get("/", (req, res) => {
    res.send("Hello, TypeScript with Express");
});
// app.use(errorHandler);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true, // 🔑 allow cookies
    },
});
function isJsonString(str) {
    try {
        JSON.parse(str);
    }
    catch (e) {
        return false;
    }
    return true;
}
const onlineUsers = new Map();
// Handling client connections
io.on("connection", async (socket) => {
    const userIdValue = socket.handshake.query.userId || "";
    const userId = userIdValue || userIdValue[0];
    if (userId) {
        onlineUsers.set(userId, socket.id);
        await user_model_1.User.findByIdAndUpdate(userId, { isOnline: true }).exec();
        socket.broadcast.emit("user:online", { userId });
        socket.emit("users:online-list", { users: Array.from(onlineUsers.keys()) });
    }
    // Chat message event
    socket.on("chat-message", (msg) => {
        io.emit("chat-message", msg); // Broadcast to all clients
    });
    // Disconnect event
    socket.on("disconnect", async () => {
        console.log("user disconnected:", socket.id);
        if (userId) {
            onlineUsers.delete(userId);
            await user_model_1.User.findByIdAndUpdate(userId, {
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
(0, db_1.connectDB)().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
