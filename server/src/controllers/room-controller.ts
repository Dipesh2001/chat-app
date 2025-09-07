// src/controllers/room-controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Room from "../models/room-model";
import { User } from "../models/user-model";
import { successResponse, errorResponse, toNumber } from "../helper";
import { authRequest } from "../middleware/auth";

// Create a room (direct or group)
export const createRoom = async (req: Request, res: Response) => {
  try {
    const {
      name = null,
      isPrivate = false,
      memberIds = [],
      type = "direct",
    } = req.body;
    const ownerId = (req as authRequest).user?._id;

    if (!ownerId) return errorResponse(res, "Unauthorized", {}, 401);

    // Direct chat
    if (type === "direct") {
      const [otherUserId] = memberIds;
      if (!otherUserId)
        return errorResponse(res, "UserId required for direct chat", {}, 400);

      // Check if direct room already exists
      const existingRoom = await Room.findOne({
        type: "direct",
        members: { $all: [ownerId, otherUserId], $size: 2 },
      });

      if (existingRoom) {
        return successResponse(res, "Direct chat already exists", existingRoom);
      }

      const room = await Room.create({
        type: "direct",
        name: null, // direct chat doesn’t need name
        isPrivate: true,
        owner: ownerId,
        members: [ownerId, otherUserId],
      });

      return successResponse(res, "Direct chat created", room, 201);
    }

    // Group / channel
    if (!name) return errorResponse(res, "Room name is required", {}, 400);

    const members = Array.from(new Set([ownerId, ...(memberIds || [])]));
    const existingUsers = await User.find({ _id: { $in: members } }).select(
      "_id"
    );
    if (existingUsers.length !== members.length) {
      return errorResponse(res, "One or more member IDs are invalid", {}, 400);
    }

    const room = await Room.create({
      type,
      name,
      isPrivate,
      owner: ownerId,
      members,
    });

    return successResponse(res, "Room created successfully", room, 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Error creating room");
  }
};

// Get my rooms
export const getMyRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as authRequest).user?._id;
    const page = toNumber(req.query.page, 1);
    const size = toNumber(req.query.size, 8);
    const search = req.query.search;
    if (!userId) return errorResponse(res, "Unauthorized", {}, 401);

    const rooms = await Room.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .skip((page - 1) * size)
      .limit(size)
      .sort({ updatedAt: 1 })
      .populate("owner", "name email profileImage")
      .populate("members", "name email profileImage");

    const total = await Room.countDocuments({
      $or: [{ owner: userId }, { members: userId }],
    });

    return successResponse(res, "Rooms fetched successfully", {
      rooms,
      pagination: {
        page,
        size,
        totalPages: Math.ceil(total / size),
        totalItems: total,
      },
    });
  } catch (err: any) {
    return errorResponse(res, err.message || "Error fetching rooms");
  }
};

// Get single room
export const getRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = (req as authRequest).user?._id;

    const room = await Room.findById(roomId)
      .populate("owner", "name email avatar")
      .populate("members", "name email avatar")
      .lean();

    if (!room) return errorResponse(res, "Room not found", {}, 404);

    if (
      room.isPrivate &&
      !room.members.some((m: any) => m._id.toString() === userId.toString()) &&
      room.owner._id.toString() !== userId.toString()
    ) {
      return errorResponse(
        res,
        "You don't have access to this private room",
        {},
        403
      );
    }

    return successResponse(res, "Room fetched successfully", room);
  } catch (err: any) {
    return errorResponse(res, err.message || "Error fetching room");
  }
};
