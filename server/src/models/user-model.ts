import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// User Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  profileImage?: string;
  chats: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    chats: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true, versionKey: false }
);

UserSchema.method("toJSON", function () {
  const user = this.toObject();
  const baseUrl = process.env.BASE_URL || "http://localhost:4000";

  if (user.profileImage && user.profileImage.startsWith("uploads")) {
    // Convert local image path to full URL
    user.profileImage = `${baseUrl}/${user.profileImage
      .replace(/\\/g, "/")
      .replace(/^.*uploads/, "uploads")}`;
  }

  return user;
});

// 🔐 Password Hashing
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔍 Compare Password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
