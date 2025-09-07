// src/models/room.ts
import mongoose, { Document, Schema } from "mongoose";
type roomType = "direct" | "group" | "channel";
export interface IRoom extends Document {
  name: string;
  isPrivate: boolean;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[]; // users in room
  type: roomType;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, default: null },
    isPrivate: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ["direct", "group", "channel"], // ✅ enum for Mongoose
      default: "direct",
    },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  },
  { timestamps: true }
);

// Ensure index for fast owner or member queries
RoomSchema.index({ owner: 1 });
RoomSchema.index({ members: 1 });

const Room = mongoose.model<IRoom>("Room", RoomSchema);
export default Room;
