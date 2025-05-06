export type Candidate = {
  publicKey: string;
  cid: number;
  pollId: number;
  name: string;
  votes: number;
  hasRegistered: boolean;
};

export type Poll = {
  publicKey: string;
  id: number;
  name: string;
  description: string;
  startTime: number;
  endTime: number;
  candidates: number;
};

export type GlobalState = {
  poll: Poll | null;
  candidates: Candidate[];
  voters: any[];
  regModal: string;
};

export type RootState = {
  globalStates: GlobalState;
};
