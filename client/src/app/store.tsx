import { configureStore } from "@reduxjs/toolkit";
import { roomApi } from "../features/roomApi";
import { userApi } from "../features/userApi";
import userStatusReducer from "../features/userStatusSlice";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [roomApi.reducerPath]: roomApi.reducer,
    userStatus: userStatusReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware, roomApi.middleware), // Add API middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
