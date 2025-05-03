import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionSignature,
} from "@solana/web3.js";
import idl from "../constants/idl/quorum.json";
import { Quorum } from "../constants/types/quorum";
import { Candidate, Poll } from "../types";
import { store } from "../store/store";
import { setPoll, setCandidates } from "../store/states/globalStates";

let tx;
const programId = new PublicKey(idl.address);
const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

export const getProvider = (
  publicKey: PublicKey | null,
  signTransaction: any,
  sendTransaction: any
): Program<Quorum> | null => {
  if (!publicKey || !signTransaction) {
    console.log("Public key:", publicKey);
    console.log("Sign transaction:", signTransaction);
    console.error("Wallet not connected or missing signTransaction.");
    return null;
  }

  const connection = new Connection(RPC_URL);
  const provider = new AnchorProvider(
    connection,
    { publicKey, signTransaction, sendTransaction } as unknown as Wallet,
    { commitment: "processed" }
  );

  return new Program<Quorum>(idl as any, provider);
};

export const getReadonlyProvider = (): Program<Quorum> => {
  const connection = new Connection(RPC_URL, "confirmed");

  // Use a dummy wallet for read-only operations
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Read-only provider cannot sign transactions.");
    },
    signAllTransactions: async () => {
      throw new Error("Read-only provider cannot sign transactions.");
    },
  };

  const provider = new AnchorProvider(connection, dummyWallet as any, {
    commitment: "processed",
  });

  return new Program<Quorum>(idl as any, provider);
};

export const getCounter = async (program: Program<Quorum>): Promise<BN> => {
  try {
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("counter")],
      program.programId
    );

    const counter = await program.account.counter.fetch(counterPDA);

    if (!counter) {
      console.warn("No counter found, returning zero");
      return new BN(0);
    }

    return counter.count;
  } catch (error) {
    console.error("Failed to retrieve counter:", error);
    return new BN(-1);
  }
};

export const initialize = async (
  program: Program<Quorum>,
  publicKey: PublicKey
): Promise<TransactionSignature> => {
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    programId
  );
  const [registrationsPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("registrations")],
    programId
  );

  tx = await program.methods
    .initialize()
    .accountsPartial({
      user: publicKey,
      counter: counterPDA,
      registrations: registrationsPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const createPoll = async (
  program: Program<Quorum>,
  publicKey: PublicKey,
  nextCount: BN,
  name: string,
  description: string,
  startTime: number,
  endTime: number
): Promise<TransactionSignature> => {
  const [counterPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("counter")],
    programId
  );
  const [pollPDA] = PublicKey.findProgramAddressSync(
    [nextCount.sub(new BN(1)).toArrayLike(Buffer, "le", 8)],
    programId
  );

  const start = new BN(startTime);
  const end = new BN(endTime);

  tx = await program.methods
    .createPoll(name, description, start, end)
    .accountsPartial({
      user: publicKey,
      counter: counterPDA,
      poll: pollPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const registerCandidate = async (
  program: Program<Quorum>,
  publicKey: PublicKey,
  pollId: number,
  name: string
): Promise<TransactionSignature> => {
  const PID = new BN(pollId);
  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, "le", 8)],
    programId
  );
  const [registrationsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("registrations")],
    programId
  );

  const regs = await program.account.registrations.fetch(registrationsPda);
  const CID = regs.count.add(new BN(1));

  const [candidatePda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, "le", 8), CID.toArrayLike(Buffer, "le", 8)],
    programId
  );

  tx = await program.methods
    .registerCandidate(PID, name)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      registrations: registrationsPda,
      candidate: candidatePda,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const vote = async (
  program: Program<Quorum>,
  publicKey: PublicKey,
  pollId: number,
  candidateId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId);
  const CID = new BN(candidateId);

  const [pollPda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, "le", 8)],
    programId
  );
  const [voterPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("voter"),
      PID.toArrayLike(Buffer, "le", 8),
      publicKey.toBuffer(),
    ],
    programId
  );
  const [candidatePda] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, "le", 8), CID.toArrayLike(Buffer, "le", 8)],
    programId
  );

  tx = await program.methods
    .vote(PID, CID)
    .accountsPartial({
      user: publicKey,
      poll: pollPda,
      candidate: candidatePda,
      voter: voterPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};

export const fetchAllPolls = async (
  program: Program<Quorum>
): Promise<Poll[]> => {
  try {
    const polls = await program.account.poll.all();
    const validPolls = await Promise.all(
      polls.map(async (poll) => {
        try {
          await program.account.poll.fetch(poll.publicKey);
          return poll;
        } catch (error) {
          return null;
        }
      })
    );

    return serializedPoll(validPolls.filter(Boolean));
  } catch (error) {
    console.error("Error fetching polls:", error);
    return [];
  }
};

export const fetchPollDetails = async (
  program: Program<Quorum>,
  pollAddress: string
): Promise<Poll> => {
  const poll = await program.account.poll.fetch(pollAddress);

  const serialized: Poll = {
    publicKey: pollAddress,
    id: poll.id.toNumber(),
    name: poll.name,
    description: poll.description,
    startTime: poll.startDate.toNumber() * 1000,
    endTime: poll.endDate.toNumber() * 1000,
    candidates: poll.candidates.toNumber(),
  };

  store.dispatch(setPoll(serialized));
  return serialized;
};

const serializedPoll = (polls: any[]): Poll[] =>
  polls
    .map((c: any) => {
      if (!c.account) return null;

      return {
        ...c.account,
        publicKey: c.publicKey.toBase58(),
        id: c.account.id?.toNumber() || 0,
        startTime: c.account.startDate?.toNumber() * 1000 || 0,
        endTime: c.account.endDate?.toNumber() * 1000 || 0,
        candidates: c.account.candidates?.toNumber() || 0,
      };
    })
    .filter(Boolean) as Poll[];

export const fetchAllCandidates = async (
  program: Program<Quorum>,
  pollAddress: string
): Promise<Candidate[]> => {
  const pollData = await fetchPollDetails(program, pollAddress);
  if (!pollData) return [];

  const PID = new BN(pollData.id);

  const candidateAccounts = await program.account.candidate.all();
  const candidates = candidateAccounts.filter((candidate) => {
    return candidate.account.pollId.eq(PID);
  });

  store.dispatch(setCandidates(serializedCandidates(candidates)));
  return candidates as unknown as Candidate[];
};

const serializedCandidates = (candidates: any[]): Candidate[] =>
  candidates.map((c: any) => ({
    ...c.account,
    publicKey: c.publicKey.toBase58(), // Convert to string
    cid: c.account.cid.toNumber(),
    pollId: c.account.pollId.toNumber(),
    votes: c.account.votes.toNumber(),
    name: c.account.name,
  }));

export const hasUserVoted = async (
  program: Program<Quorum>,
  publicKey: PublicKey,
  pollId: number
): Promise<boolean> => {
  const PID = new BN(pollId);

  const [voterPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("voter"),
      PID.toArrayLike(Buffer, "le", 8),
      publicKey.toBuffer(),
    ],
    programId
  );

  try {
    const voterAccount = await program.account.voter.fetch(voterPda);
    if (!voterAccount || !voterAccount.hasVoted) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error fetching voter account:", error);
    return false;
  }
};

export const deletePoll = async (
  program: Program<Quorum>,
  publicKey: PublicKey,
  pollId: number
): Promise<TransactionSignature> => {
  const PID = new BN(pollId);
  const [pollPDA] = PublicKey.findProgramAddressSync(
    [PID.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  let tx = await program.methods
    .deletePoll()
    .accountsPartial({
      user: publicKey,
      poll: pollPDA,
    })
    .rpc();

  const connection = new Connection(
    program.provider.connection.rpcEndpoint,
    "confirmed"
  );
  await connection.confirmTransaction(tx, "finalized");

  return tx;
};
