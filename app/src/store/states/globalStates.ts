import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Candidate, Poll } from "@/types";

interface GlobalStates {
  poll: Poll | null;
  candidates: Candidate[];
  regModal: string;
  voters: any[];
}

const initialState: GlobalStates = {
  poll: null,
  candidates: [],
  regModal: "scale-0",
  voters: [],
};

export const globalStatesSlice = createSlice({
  name: "globalStates",
  initialState,
  reducers: {
    setPoll: (state, action: PayloadAction<Poll>) => {
      state.poll = action.payload;
    },
    setCandidates: (state, action: PayloadAction<Candidate[]>) => {
      state.candidates = action.payload;
    },
    setRegModal: (state, action: PayloadAction<string>) => {
      state.regModal = action.payload;
    },
    setVoters: (state, action: PayloadAction<any[]>) => {
      state.voters = action.payload;
    },
    resetState: (state) => {
      state.poll = null;
      state.candidates = [];
      state.regModal = "scale-0";
      state.voters = [];
    },
  },
});

export const { setPoll, setCandidates, setRegModal, setVoters, resetState } =
  globalStatesSlice.actions;
export default globalStatesSlice.reducer;
