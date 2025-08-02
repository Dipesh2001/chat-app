// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Handling client connections
io.on("connection", (socket) => {
  // Chat message event
  console.log({socket})
  socket.on("chat-message", (msg) => {
    io.emit("chat-message", msg); // Broadcast to all clients
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});