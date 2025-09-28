import { configureStore } from "@reduxjs/toolkit";
import { roomApi } from "../features/roomApi";
import { userApi } from "../features/userApi";
import { messageApi } from "../features/messageApi";
import userStatusReducer from "../features/userStatusSlice";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    userStatus: userStatusReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      roomApi.middleware,
      messageApi.middleware
    ), // Add API middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
