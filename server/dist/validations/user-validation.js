"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manageFollowSchema = exports.manageFavoritesSchema = exports.loginUserSchema = exports.registerUserSchema = void 0;
const zod_1 = require("zod");
exports.registerUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.loginUserSchema = zod_1.z.object({
    email: zod_1.z.email("Invalid email"),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.manageFavoritesSchema = zod_1.z.object({
    type: zod_1.z.enum(["favoriteSongs", "favoriteAlbums", "favoritePlaylists"]),
    id: zod_1.z.string().min(1, "ID is required"),
});
exports.manageFollowSchema = zod_1.z.object({
    artistId: zod_1.z.string().min(1, "Artist ID is required"),
});
