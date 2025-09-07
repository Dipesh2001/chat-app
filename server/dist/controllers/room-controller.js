"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoom = exports.getMyRooms = exports.createRoom = void 0;
const room_model_1 = __importDefault(require("../models/room-model"));
const user_model_1 = require("../models/user-model");
const helper_1 = require("../helper");
// Create a room (direct or group)
const createRoom = async (req, res) => {
    try {
        const { name = null, isPrivate = false, memberIds = [], type = "direct", } = req.body;
        const ownerId = req.user?._id;
        if (!ownerId)
            return (0, helper_1.errorResponse)(res, "Unauthorized", {}, 401);
        // Direct chat
        if (type === "direct") {
            const [otherUserId] = memberIds;
            if (!otherUserId)
                return (0, helper_1.errorResponse)(res, "UserId required for direct chat", {}, 400);
            // Check if direct room already exists
            const existingRoom = await room_model_1.default.findOne({
                type: "direct",
                members: { $all: [ownerId, otherUserId], $size: 2 },
            });
            if (existingRoom) {
                return (0, helper_1.successResponse)(res, "Direct chat already exists", existingRoom);
            }
            const room = await room_model_1.default.create({
                type: "direct",
                name: null, // direct chat doesn’t need name
                isPrivate: true,
                owner: ownerId,
                members: [ownerId, otherUserId],
            });
            return (0, helper_1.successResponse)(res, "Direct chat created", room, 201);
        }
        // Group / channel
        if (!name)
            return (0, helper_1.errorResponse)(res, "Room name is required", {}, 400);
        const members = Array.from(new Set([ownerId, ...(memberIds || [])]));
        const existingUsers = await user_model_1.User.find({ _id: { $in: members } }).select("_id");
        if (existingUsers.length !== members.length) {
            return (0, helper_1.errorResponse)(res, "One or more member IDs are invalid", {}, 400);
        }
        const room = await room_model_1.default.create({
            type,
            name,
            isPrivate,
            owner: ownerId,
            members,
        });
        return (0, helper_1.successResponse)(res, "Room created successfully", room, 201);
    }
    catch (err) {
        return (0, helper_1.errorResponse)(res, err.message || "Error creating room");
    }
};
exports.createRoom = createRoom;
// Get my rooms
const getMyRooms = async (req, res) => {
    try {
        const userId = req.user?._id;
        const page = (0, helper_1.toNumber)(req.query.page, 1);
        const size = (0, helper_1.toNumber)(req.query.size, 8);
        const search = req.query.search;
        if (!userId)
            return (0, helper_1.errorResponse)(res, "Unauthorized", {}, 401);
        const rooms = await room_model_1.default.find({
            $or: [{ owner: userId }, { members: userId }],
        })
            .skip((page - 1) * size)
            .limit(size)
            .sort({ updatedAt: 1 })
            .populate("owner", "name email profileImage")
            .populate("members", "name email profileImage");
        const total = await room_model_1.default.countDocuments({
            $or: [{ owner: userId }, { members: userId }],
        });
        return (0, helper_1.successResponse)(res, "Rooms fetched successfully", {
            rooms,
            pagination: {
                page,
                size,
                totalPages: Math.ceil(total / size),
                totalItems: total,
            },
        });
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
