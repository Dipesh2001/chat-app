import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    if(MONGO_URI){
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // Optional: Adjust timeouts
      });
      console.log("✅ MongoDB Connected");
    }
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};