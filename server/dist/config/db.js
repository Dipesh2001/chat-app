"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = process.env.MONGO_URI;
const connectDB = async () => {
    try {
        if (MONGO_URI) {
            await mongoose_1.default.connect(MONGO_URI, {
                serverSelectionTimeoutMS: 5000, // Optional: Adjust timeouts
            });
            console.log("✅ MongoDB Connected");
        }
    }
    catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
