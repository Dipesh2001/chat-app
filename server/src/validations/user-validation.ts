import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginUserSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const manageFavoritesSchema = z.object({
  type: z.enum(["favoriteSongs", "favoriteAlbums", "favoritePlaylists"]),
  id: z.string().min(1, "ID is required"),
});

export const manageFollowSchema = z.object({
  artistId: z.string().min(1, "Artist ID is required"),
});
