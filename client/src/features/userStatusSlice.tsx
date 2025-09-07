// src/features/userStatusSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserStatus {
  isOnline: boolean;
  lastSeen: string | null; // ISO string
}

interface UserStatusState {
  [userId: string]: UserStatus;
}

const initialState: UserStatusState = {};

const userStatusSlice = createSlice({
  name: "userStatus",
  initialState,
  reducers: {
    setUserOnline: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state[userId] = {
        ...(state[userId] || {}),
        isOnline: true,
        lastSeen: null,
      };
    },
    setUserOffline: (
      state,
      action: PayloadAction<{ userId: string; lastSeen?: string }>
    ) => {
      const { userId, lastSeen } = action.payload;
      state[userId] = {
        ...(state[userId] || {}),
        isOnline: false,
        lastSeen: lastSeen || new Date().toISOString(),
      };
    },
    setMultipleStatuses: (
      state,
      action: PayloadAction<{ [userId: string]: UserStatus }>
    ) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setUserOnline, setUserOffline, setMultipleStatuses } =
  userStatusSlice.actions;
export default userStatusSlice.reducer;
