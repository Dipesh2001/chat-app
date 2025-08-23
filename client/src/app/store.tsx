import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "../features/userApi";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer, // Add API slice reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      userApi.middleware,
    ]), // Add API middleware
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
