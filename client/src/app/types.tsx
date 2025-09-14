export interface common {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends common {
  name: string;
  email: string;
  password: string;
  profileImage: string;
  lastSeen?: string; // ISO string
}

export type InviteStatus = "pending" | "accepted" | "rejected";

export interface pagination {
  page: number;
  size: number;
  totalPages?: number;
  totalItems?: number;
  search?: string;
}

export interface Room extends common {
  name: string;
  isPrivate: boolean;
  type: "direct" | "group" | "channel";
  owner: String;
  members: Partial<User[]>; // users in room
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Album extends common {
  name: string;
  coverImage: string;
  artists: string[];
  genre: string;
  language: string;
  description?: string;
  releaseDate: Date;
  status: boolean;
  likes: number;
}

export interface Artist extends common {
  name: string;
  image?: string; // URL or path to the image
  bio?: string;
  country?: string;
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  followers: number;
  isActive: boolean;
}
