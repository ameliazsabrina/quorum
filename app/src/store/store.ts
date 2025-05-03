import { configureStore } from "@reduxjs/toolkit";
import globalStatesReducer from "./states/globalStates";

export const store = configureStore({
  reducer: {
    globalStates: globalStatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
        ignoredActionPaths: [],
        ignoredPaths: [],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
