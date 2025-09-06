"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserToken = exports.logoutUser = exports.loginUser = exports.updateUser = exports.fetchUsers = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const helper_1 = require("../helper");
const user_model_1 = require("../models/user-model");
const handleUploadError_1 = require("../middleware/handleUploadError");
const fs_1 = __importDefault(require("fs"));
const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            return (0, helper_1.errorResponse)(res, "User already exists", { field: "email" });
        }
        const user = new user_model_1.User({ name, email, password });
        await user.save();
        (0, helper_1.successResponse)(res, "User registered successfully", { user });
    }
    catch (error) {
        (0, helper_1.errorResponse)(res, "Error registering user");
    }
};
exports.createUser = createUser;
const fetchUsers = async (req, res) => {
    try {
        const currentUserId = req.user.id; // from auth middleware
        const page = (0, helper_1.toNumber)(req.query.page, 1);
        const size = (0, helper_1.toNumber)(req.query.size, 8);
        const search = req.query.search;
        // if (!q) {
        //   return res.status(400).json({ message: "Query param 'q' is required" });
        // }
        // Find users matching query, exclude current user
        const users = await user_model_1.User.find({
            _id: { $ne: currentUserId }, // exclude self
            name: { $regex: search || "", $options: "i" }, // case-insensitive search
        }, "name id profileImage")
            .select("-password")
            .skip((page - 1) * size)
            .limit(size)
            .sort({ updatedAt: 1 });
        (0, helper_1.successResponse)(res, "Users fetched successfully", { users });
    }
    catch (error) {
        console.log({ error });
        (0, helper_1.errorResponse)(res, "Error fetching user");
    }
};
exports.fetchUsers = fetchUsers;
// updateUser
const updateUser = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.params.id;
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            (0, helper_1.errorResponse)(res, "User not found", {});
            return;
        }
        else {
            // If a new image is uploaded, replace the old one
            if (req.file) {
                if (user.profileImage && fs_1.default.existsSync(user.profileImage)) {
                    fs_1.default.unlink(user.profileImage, (err) => {
                        if (err)
                            console.error("Error deleting old image:", err);
                    });
                }
                user.profileImage = req.file.path.replace(/\\/g, "/"); // Normalize path
            }
            user.name = name || user.name;
            await user.save();
        }
        (0, helper_1.successResponse)(res, "User updated successfully", { user });
    }
    catch (error) {
        (0, handleUploadError_1.removeUploadedFile)(req);
        (0, helper_1.errorResponse)(res, "Failed to update user", {});
    }
};
exports.updateUser = updateUser;
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.User.findOne({ email });
        if (!user)
            return (0, helper_1.errorResponse)(res, "User not found");
        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return (0, helper_1.errorResponse)(res, "Invalid credentials");
        const token = jsonwebtoken_1.default.sign({ user }, process.env.JWT_SECRET || "", {
            expiresIn: "7h",
        });
        res.cookie("validateUserToken", JSON.stringify({ user, authToken: token }), {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
        });
        (0, helper_1.successResponse)(res, "Login successful", { user, authToken: token });
    }
    catch (error) {
        console.log({ error });
        (0, helper_1.errorResponse)(res, "Login failed");
    }
};
exports.loginUser = loginUser;
const logoutUser = async (req, res) => {
    try {
        res.clearCookie("validateUserToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: "strict",
        });
        (0, helper_1.successResponse)(res, "Logged out");
    }
    catch (error) {
        (0, helper_1.errorResponse)(res, "Error during logout");
    }
};
exports.logoutUser = logoutUser;
const validateUserToken = async (req, res) => {
    try {
        (0, helper_1.successResponse)(res, "User validated", {
            user: req.user,
            authToken: req.authToken,
        });
    }
    catch (error) {
        (0, helper_1.errorResponse)(res, "Error validating user");
    }
};
exports.validateUserToken = validateUserToken;
