import { Request, Response } from "express";
import { Message } from "../models/message-model";
import { successResponse, errorResponse, toNumber } from "../helper";
import { authRequest } from "../middleware/auth";

// ✅ Get paginated messages for a room
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const page = toNumber(req.query.page, 1);
    const size = toNumber(req.query.size, 20);

    const messages = await Message.find({ roomId })
      .sort({ updatedAt: -1 }) // newest first
      .skip((page - 1) * size)
      .limit(size)
      .lean();

    const total = await Message.countDocuments({ roomId });

    return successResponse(res, "Messages fetched successfully", {
      messages,
      pagination: {
        page,
        size,
        totalPages: Math.ceil(total / size),
        totalItems: total,
      },
    });
  } catch (err: any) {
    return errorResponse(res, err.message || "Error fetching messages");
  }
};

// ✅ Edit message
export const editMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = (req as authRequest).user?._id;
    const { content } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return errorResponse(res, "Message not found", {}, 404);

    // Only sender can edit
    if (message.senderId.toString() !== userId.toString()) {
      return errorResponse(res, "Unauthorized to edit this message", {}, 403);
    }

    message.content = content;
    await message.save();

    return successResponse(res, "Message updated successfully", message);
  } catch (err: any) {
    return errorResponse(res, err.message || "Error editing message");
  }
};

// ✅ Delete message
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = (req as authRequest).user?._id;

    const message = await Message.findById(messageId);
    if (!message) return errorResponse(res, "Message not found", {}, 404);

    // Only sender can delete
    if (message.senderId.toString() !== userId.toString()) {
      return errorResponse(res, "Unauthorized to delete this message", {}, 403);
    }

    await message.deleteOne();

    return successResponse(res, "Message deleted successfully", {});
  } catch (err: any) {
    return errorResponse(res, err.message || "Error deleting message");
  }
};
