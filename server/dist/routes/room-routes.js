"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/room-routes.ts
const express_1 = __importDefault(require("express"));
const room_controller_1 = require("../controllers/room-controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create room
router.post("/", (0, auth_1.auth)("user"), room_controller_1.createRoom);
// Invite someone
router.post("/:roomId/invite", (0, auth_1.auth)("user"), room_controller_1.inviteToRoom);
// Respond to invite (accept/reject)
router.post("/:roomId/respond", (0, auth_1.auth)("user"), room_controller_1.respondToInvite);
// Get current user's rooms
router.get("/", (0, auth_1.auth)("user"), room_controller_1.getMyRooms);
// Get single room details
router.get("/:roomId", (0, auth_1.auth)("user"), room_controller_1.getRoom);
exports.default = router;
