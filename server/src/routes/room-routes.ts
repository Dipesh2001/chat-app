// src/routes/room-routes.ts
import express from "express";
import {
  createRoom,
  inviteToRoom,
  respondToInvite,
  getMyRooms,
  getRoom,
} from "../controllers/room-controller";
import { auth } from "../middleware/auth";

const router = express.Router();

// Create room
router.post("/", auth("user"), createRoom);

// Invite someone
router.post("/:roomId/invite", auth("user"), inviteToRoom);

// Respond to invite (accept/reject)
router.post("/:roomId/respond", auth("user"), respondToInvite);

// Get current user's rooms
router.get("/", auth("user"), getMyRooms);

// Get single room details
router.get("/:roomId", auth("user"), getRoom);

export default router;
