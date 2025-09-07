// src/routes/room-routes.ts
import express from "express";
import {
  createRoom,
  getMyRooms,
  getRoom,
} from "../controllers/room-controller";
import { auth } from "../middleware/auth";

const router = express.Router();

// Create room
router.post("/", auth("user"), createRoom);

// Get current user's rooms
router.get("/", auth("user"), getMyRooms);

// Get single room details
router.get("/:roomId", auth("user"), getRoom);

export default router;
