import express from "express";
import { auth } from "../middleware/auth";
import {
  getMessages,
  editMessage,
  deleteMessage,
} from "../controllers/message-controller";

const router = express.Router();

// Fetch messages for a room (with pagination)
router.get("/:roomId", auth("user"), getMessages);

// Edit a message
router.put("/:messageId", auth("user"), editMessage);

// Delete a message
router.delete("/:messageId", auth("user"), deleteMessage);

export default router;
