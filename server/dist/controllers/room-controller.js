"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoom = exports.getMyRooms = exports.respondToInvite = exports.inviteToRoom = exports.createRoom = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const room_model_1 = __importDefault(require("../models/room-model"));
const user_model_1 = require("../models/user-model");
const helper_1 = require("../helper");
// Create a room
const createRoom = async (req, res) => {
    try {
        const { name, isPrivate = false, memberIds = [] } = req.body;
        const ownerId = req.user?._id;
        if (!ownerId) {
            return (0, helper_1.errorResponse)(res, "Unauthorized", {}, 401);
        }
        if (!name) {
            return (0, helper_1.errorResponse)(res, "Room name is required", {}, 400);
        }
        const members = Array.from(new Set([ownerId, ...(memberIds || [])]));
        const objectIds = members.map((m) => m);
        const existingUsers = await user_model_1.User.find({ _id: { $in: objectIds } }).select("_id");
        if (existingUsers.length !== objectIds.length) {
            return (0, helper_1.errorResponse)(res, "One or more member IDs are invalid", {}, 400);
        }
        const room = await room_model_1.default.create({
            name,
            isPrivate,
            owner: ownerId,
            members: objectIds,
            invites: [],
        });
        return (0, helper_1.successResponse)(res, "Room created successfully", room, 201);
    }
    catch (err) {
        return (0, helper_1.errorResponse)(res, err.message || "Error creating room");
    }
};
exports.createRoom = createRoom;
// Invite user
const inviteToRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { toUserId } = req.body;
        const actorId = req.user?._id;
        if (!actorId)
            return (0, helper_1.errorResponse)(res, "Unauthorized", {}, 401);
        if (!toUserId)
            return (0, helper_1.errorResponse)(res, "toUserId is required", {}, 400);
        const room = await room_model_1.default.findById(roomId);
        if (!room)
            return (0, helper_1.errorResponse)(res, "Room not found", {}, 404);
        const isMember = room.members.some((m) => m.toString() === actorId.toString());
        const isOwner = room.owner.toString() === actorId.toString();
        if (!isMember && !isOwner)
            return (0, helper_1.errorResponse)(res, "Not allowed to invite", {}, 403);
        if (room.members.some((m) => m.toString() === toUserId)) {
            return (0, helper_1.errorResponse)(res, "User already a member", {}, 400);
        }
        const existingInvite = room.invites.find((i) => i.to.toString() === toUserId.toString());
        if (existingInvite) {
            if (existingInvite.status === "pending") {
                return (0, helper_1.errorResponse)(res, "Invite already pending", {}, 400);
            }
            existingInvite.status = "pending";
            existingInvite.invitedBy = actorId;
            existingInvite.invitedAt = new Date();
        }
        else {
            const invite = {
                to: new mongoose_1.default.Types.ObjectId(toUserId),
                invitedBy: new mongoose_1.default.Types.ObjectId(actorId),
                status: "pending",
                invitedAt: new Date(),
            };
            room.invites.push(invite);
        }
        await room.save();
        return (0, helper_1.successResponse)(res, "User invited successfully", room);
    }
    catch (err) {
        return (0, helper_1.errorResponse)(res, err.message || "Error inviting user");
    }
};
exports.inviteToRoom = inviteToRoom;
// Respond to invite
const respondToInvite = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { action } = req.body;
        const actorId = req.user?._id;
        if (!actorId)
            return (0, helper_1.errorResponse)(res, "Unauthorized", {}, 401);
        if (!["accept", "reject"].includes(action)) {
            return (0, helper_1.errorResponse)(res, "Invalid action", {}, 400);
        }
        const room = await room_model_1.default.findById(roomId);
        if (!room)
            return (0, helper_1.errorResponse)(res, "Room not found", {}, 404);
        const invite = room.invites.find((inv) => inv.to.toString() === actorId.toString());
        if (!invite)
            return (0, helper_1.errorResponse)(res, "Invite not found", {}, 404);
        if (invite.status !== "pending") {
            return (0, helper_1.errorResponse)(res, `Invite already ${invite.status}`, {}, 400);
        }
        if (action === "accept") {
            if (!room.members.some((m) => m.toString() === actorId.toString())) {
                room.members.push(new mongoose_1.default.Types.ObjectId(actorId));
            }
            invite.status = "accepted";
            invite.respondedAt = new Date();
            await room.save();
            return (0, helper_1.successResponse)(res, "Invite accepted", room);
        }
        else {
            invite.status = "rejected";
            invite.respondedAt = new Date();
            await room.save();
            return (0, helper_1.successResponse)(res, "Invite rejected", room);
        }
    }
    catch (err) {
        return (0, helper_1.errorResponse)(res, err.message || "Error responding to invite");
    }
};
exports.respondToInvite = respondToInvite;
// Get my rooms
const getMyRooms = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return (0, helper_1.errorResponse)(res, "Unauthorized", {}, 401);
        const rooms = await room_model_1.default.find({
            $or: [{ owner: userId }, { members: userId }],
        })
            .populate("owner", "name email avatar")
            .populate("members", "name email avatar");
        return (0, helper_1.successResponse)(res, "Rooms fetched successfully", rooms);
    }
    catch (err) {
        return (0, helper_1.errorResponse)(res, err.message || "Error fetching rooms");
    }
};
exports.getMyRooms = getMyRooms;
// Get single room
const getRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user?._id;
        const room = await room_model_1.default.findById(roomId)
            .populate("owner", "name email avatar")
            .populate("members", "name email avatar")
            .lean();
        if (!room)
            return (0, helper_1.errorResponse)(res, "Room not found", {}, 404);
        if (room.isPrivate &&
            !room.members.some((m) => m._id.toString() === userId.toString()) &&
            room.owner._id.toString() !== userId.toString()) {
            return (0, helper_1.errorResponse)(res, "You don't have access to this private room", {}, 403);
        }
        return (0, helper_1.successResponse)(res, "Room fetched successfully", room);
    }
    catch (err) {
        return (0, helper_1.errorResponse)(res, err.message || "Error fetching room");
    }
};
exports.getRoom = getRoom;
