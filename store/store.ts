import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./slices/chatSlice";
import { localStorageMiddleware } from "./middleware/localStorageMiddleware";
export const store = configureStore({
  reducer: {
    chats: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
