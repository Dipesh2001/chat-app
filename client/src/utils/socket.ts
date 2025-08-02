// src/utils/socket.ts
import { io } from "socket.io-client";

// Connect to the Socket.IO server
const socket = io("https://turbo-bassoon-4rwxxvj4vx4hj496-4000.app.github.dev");

export default socket;
