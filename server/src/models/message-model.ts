import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  type: "text" | "image" | "file" | "audio" | "system";
  seenBy: string[];
}

const MessageSchema: Schema = new Schema<IMessage>(
  {
    roomId: { type: String, required: true },
    senderId: { type: String, required: false },
    senderName: { type: String, required: true },
    senderAvatar: { type: String },
    content: { type: String, required: true }, // <-- keep content
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "audio", "system"],
      default: "text",
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
