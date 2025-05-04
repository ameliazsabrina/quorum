import { configureStore } from "@reduxjs/toolkit";
import globalStates from "./states/globalStates";

export const store = configureStore({
  reducer: {
    globalStates: globalStates,
  },
});
