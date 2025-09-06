// src/controllers/room-controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import Room, { IRoomInvite } from "../models/room-model";
import { User } from "../models/user-model";
import { successResponse, errorResponse } from "../helper";
import { authRequest } from "../middleware/auth";

// Create a room
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, isPrivate = false, memberIds = [] } = req.body;
    const ownerId = (req as authRequest).user?._id;

    if (!ownerId) {
      return errorResponse(res, "Unauthorized", {}, 401);
    }
    if (!name) {
      return errorResponse(res, "Room name is required", {}, 400);
    }

    const members = Array.from(new Set([ownerId, ...(memberIds || [])]));
    const objectIds = members.map((m: string) => m);

    const existingUsers = await User.find({ _id: { $in: objectIds } }).select(
      "_id"
    );
    if (existingUsers.length !== objectIds.length) {
      return errorResponse(res, "One or more member IDs are invalid", {}, 400);
    }

    const room = await Room.create({
      name,
      isPrivate,
      owner: ownerId,
      members: objectIds,
      invites: [],
    });

    return successResponse(res, "Room created successfully", room, 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Error creating room");
  }
};

// Invite user
export const inviteToRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { toUserId } = req.body;
    const actorId = (req as authRequest).user?._id;

    if (!actorId) return errorResponse(res, "Unauthorized", {}, 401);
    if (!toUserId) return errorResponse(res, "toUserId is required", {}, 400);

    const room = await Room.findById(roomId);
    if (!room) return errorResponse(res, "Room not found", {}, 404);

    const isMember = room.members.some(
      (m) => m.toString() === actorId.toString()
    );
    const isOwner = room.owner.toString() === actorId.toString();
    if (!isMember && !isOwner)
      return errorResponse(res, "Not allowed to invite", {}, 403);

    if (room.members.some((m) => m.toString() === toUserId)) {
      return errorResponse(res, "User already a member", {}, 400);
    }

    const existingInvite = room.invites.find(
      (i) => i.to.toString() === toUserId.toString()
    );
    if (existingInvite) {
      if (existingInvite.status === "pending") {
        return errorResponse(res, "Invite already pending", {}, 400);
      }
      existingInvite.status = "pending";
      existingInvite.invitedBy = actorId;
      existingInvite.invitedAt = new Date();
    } else {
      const invite: IRoomInvite = {
        to: new mongoose.Types.ObjectId(toUserId),
        invitedBy: new mongoose.Types.ObjectId(actorId),
        status: "pending",
        invitedAt: new Date(),
      } as IRoomInvite;

      room.invites.push(invite);
    }

    await room.save();
    return successResponse(res, "User invited successfully", room);
  } catch (err: any) {
    return errorResponse(res, err.message || "Error inviting user");
  }
};

// Respond to invite
export const respondToInvite = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { action } = req.body;
    const actorId = (req as authRequest).user?._id;

    if (!actorId) return errorResponse(res, "Unauthorized", {}, 401);
    if (!["accept", "reject"].includes(action)) {
      return errorResponse(res, "Invalid action", {}, 400);
    }

    const room = await Room.findById(roomId);
    if (!room) return errorResponse(res, "Room not found", {}, 404);

    const invite = room.invites.find(
      (inv) => inv.to.toString() === actorId.toString()
    );
    if (!invite) return errorResponse(res, "Invite not found", {}, 404);

    if (invite.status !== "pending") {
      return errorResponse(res, `Invite already ${invite.status}`, {}, 400);
    }

    if (action === "accept") {
      if (!room.members.some((m) => m.toString() === actorId.toString())) {
        room.members.push(new mongoose.Types.ObjectId(actorId));
      }
      invite.status = "accepted";
      invite.respondedAt = new Date();
      await room.save();
      return successResponse(res, "Invite accepted", room);
    } else {
      invite.status = "rejected";
      invite.respondedAt = new Date();
      await room.save();
      return successResponse(res, "Invite rejected", room);
    }
  } catch (err: any) {
    return errorResponse(res, err.message || "Error responding to invite");
  }
};

// Get my rooms
export const getMyRooms = async (req: Request, res: Response) => {
  try {
    const userId = (req as authRequest).user?._id;
    if (!userId) return errorResponse(res, "Unauthorized", {}, 401);

    const rooms = await Room.find({
      $or: [{ owner: userId }, { members: userId }],
    })
      .populate("owner", "name email avatar")
      .populate("members", "name email avatar");

    return successResponse(res, "Rooms fetched successfully", rooms);
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
