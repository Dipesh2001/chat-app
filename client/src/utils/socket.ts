// src/utils/socket.ts
import { io } from "socket.io-client";

// Connect to the Socket.IO server
const socket = io("http://localhost:4000");

export default socket;
