// src/models/room.ts
import mongoose, { Document, Schema } from "mongoose";

export type InviteStatus = "pending" | "accepted" | "rejected";

export interface IRoomInvite {
  to: mongoose.Types.ObjectId; // user invited
  invitedBy: mongoose.Types.ObjectId; // who invited
  status: InviteStatus;
  invitedAt: Date;
  respondedAt?: Date;
}

export interface IRoom extends Document {
  name: string;
  isPrivate: boolean;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[]; // users in room
  invites: IRoomInvite[];
  createdAt: Date;
  updatedAt: Date;
}

const InviteSchema = new Schema<IRoomInvite>(
  {
    to: { type: Schema.Types.ObjectId, ref: "User", required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    invitedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
  },
  { _id: false }
);

const RoomSchema = new Schema<IRoom>(
  {
    name: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    invites: [InviteSchema],
  },
  { timestamps: true }
);

// Ensure index for fast owner or member queries
RoomSchema.index({ owner: 1 });
RoomSchema.index({ members: 1 });

const Room = mongoose.model<IRoom>("Room", RoomSchema);
export default Room;
