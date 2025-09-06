import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { successResponse, errorResponse, toNumber } from "../helper";
import { authRequest } from "../middleware/auth";
import { User } from "../models/user-model";
import { removeUploadedFile } from "../middleware/handleUploadError";
import fs from "fs";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "User already exists", { field: "email" });
    }
    const user = new User({ name, email, password });
    await user.save();
    successResponse(res, "User registered successfully", { user });
  } catch (error) {
    errorResponse(res, "Error registering user");
  }
};

export const fetchUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.id; // from auth middleware
    const page = toNumber(req.query.page, 1);
    const size = toNumber(req.query.size, 8);
    const search = req.query.search;
    // if (!q) {
    //   return res.status(400).json({ message: "Query param 'q' is required" });
    // }

    // Find users matching query, exclude current user
    const users = await User.find(
      {
        _id: { $ne: currentUserId }, // exclude self
        name: { $regex: search || "", $options: "i" }, // case-insensitive search
      },
      "name id profileImage"
    )
      .select("-password")
      .skip((page - 1) * size)
      .limit(size)
      .sort({ updatedAt: 1 });

    successResponse(res, "Users fetched successfully", { users });
  } catch (error) {
    console.log({ error });
    errorResponse(res, "Error fetching user");
  }
};

// updateUser
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      errorResponse(res, "User not found", {});
      return;
    } else {
      // If a new image is uploaded, replace the old one
      if (req.file) {
        if (user.profileImage && fs.existsSync(user.profileImage)) {
          fs.unlink(user.profileImage, (err) => {
            if (err) console.error("Error deleting old image:", err);
          });
        }

        user.profileImage = req.file.path.replace(/\\/g, "/"); // Normalize path
      }

      user.name = name || user.name;

      await user.save();
    }
    successResponse(res, "User updated successfully", { user });
  } catch (error) {
    removeUploadedFile(req);
    errorResponse(res, "Failed to update user", {});
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, "User not found");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return errorResponse(res, "Invalid credentials");

    const token = jwt.sign({ user }, process.env.JWT_SECRET || "", {
      expiresIn: "7h",
    });

    res.cookie(
      "validateUserToken",
      JSON.stringify({ user, authToken: token }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
      }
    );

    successResponse(res, "Login successful", { user, authToken: token });
  } catch (error) {
    console.log({ error });
    errorResponse(res, "Login failed");
  }
};

export const logoutUser = async (req: authRequest, res: Response) => {
  try {
    res.clearCookie("validateUserToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });
    successResponse(res, "Logged out");
  } catch (error) {
    errorResponse(res, "Error during logout");
  }
};

export const validateUserToken = async (req: authRequest, res: Response) => {
  try {
    successResponse(res, "User validated", {
      user: req.user,
      authToken: req.authToken,
    });
  } catch (error) {
    errorResponse(res, "Error validating user");
  }
};
