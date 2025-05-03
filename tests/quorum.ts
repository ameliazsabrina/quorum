import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Quorum } from "../target/types/quorum";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("quorum", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.quorum as Program<Quorum>;
  const user = provider.wallet;

  let pollId: anchor.BN;
  let candidateId: anchor.BN;

  it("Is initialized!", async () => {
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("counter")],
      program.programId
    );

    const [registrationsPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("registrations")],
      program.programId
    );

    let counter;
    try {
      counter = await program.account.counter.fetch(counterPDA);
      console.log("Counter already initialized:", counter.count.toString());
    } catch (error) {
      console.log("Counter not found, initializing...");

      try {
        await program.methods
          .initialize()
          .accounts({
            user: user.publicKey,
            counter: counterPDA,
            registrations: registrationsPDA,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } catch (initError) {
        console.error("Error initializing:", initError);
        throw initError;
      }

      counter = await program.account.counter.fetch(counterPDA);
      console.log("Counter initialized:", counter.count.toString());
    }

    pollId = counter.count;

    const [pollPDA] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const name = `Poll #${pollId}`;
    const description = `Description for Poll #${pollId}`;
    const startTime = new anchor.BN(Math.floor(Date.now() / 1000));
    const endTime = new anchor.BN(startTime.toNumber() + 100);

    console.log("Creating poll with name:", name);

    try {
      await program.methods
        .createPoll(name, description, startTime, endTime)
        .accounts({
          user: user.publicKey,
          poll: pollPDA,
          counter: counterPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (pollError) {
      console.error("Error creating poll:", pollError);
      throw pollError;
    }

    const poll = await program.account.poll.fetch(pollPDA);
    console.log("Poll created:", poll);
    console.log("Poll property names:", Object.keys(poll));

    assert.equal(poll.id.toString(), pollId.toString());
  });

  it("Register candidate", async () => {
    const [registrationsPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("registrations")],
      program.programId
    );

    const registrations = await program.account.registrations.fetch(
      registrationsPDA
    );
    candidateId = registrations.count.add(new anchor.BN(1));

    const [pollPDA] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [candidatePDA] = PublicKey.findProgramAddressSync(
      [
        pollId.toArrayLike(Buffer, "le", 8),
        candidateId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const candidateName = `Candidate #${candidateId}`;
    console.log(`Registering candidate: ${candidateName}, ID: ${candidateId}`);

    try {
      await program.methods
        .registerCandidate(pollId, candidateName)
        .accounts({
          user: user.publicKey,
          poll: pollPDA,
          registrations: registrationsPDA,
          candidate: candidatePDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      console.error("Error registering candidate:", error);
      throw error;
    }

    const candidate = await program.account.candidate.fetch(candidatePDA);
    console.log("Candidate registered:", candidate);

    console.log("Candidate property names:", Object.keys(candidate));

    assert.equal(
      candidate.cid.toString(),
      candidateId.toString(),
      "Candidate ID should match"
    );
    assert.equal(
      candidate.pollId.toString(),
      pollId.toString(),
      "Poll ID should match"
    );
    assert.equal(candidate.name, candidateName, "Candidate name should match");
    assert.equal(
      candidate.hasRegistered,
      true,
      "Candidate should be registered"
    );
  });

  it("Vote", async () => {
    const [pollPDA] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    const [candidatePDA] = PublicKey.findProgramAddressSync(
      [
        pollId.toArrayLike(Buffer, "le", 8),
        candidateId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [voterPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("voter"),
        pollId.toArrayLike(Buffer, "le", 8),
        user.publicKey.toBuffer(),
      ],
      program.programId
    );

    console.log(`Voting for candidate ${candidateId} in poll ${pollId}`);

    const candidateBefore = await program.account.candidate.fetch(candidatePDA);
    console.log("Candidate votes before:", candidateBefore.votes.toString());

    try {
      await program.methods
        .vote(pollId, candidateId)
        .accounts({
          user: user.publicKey,
          poll: pollPDA,
          candidate: candidatePDA,
          voter: voterPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (error) {
      console.error("Error voting:", error);
      throw error;
    }

    const voter = await program.account.voter.fetch(voterPDA);
    console.log("Voter record:", voter);
    console.log("Voter property names:", Object.keys(voter));

    const candidateAfter = await program.account.candidate.fetch(candidatePDA);
    console.log("Candidate votes after:", candidateAfter.votes.toString());

    assert.equal(
      voter.cid.toString(),
      candidateId.toString(),
      "Voter candidate ID should match"
    );
    assert.equal(
      voter.pollId.toString(),
      pollId.toString(),
      "Voter poll ID should match"
    );
    assert.equal(
      voter.hasVoted,
      true,
      "Voter should be marked as having voted"
    );
    assert.equal(
      candidateAfter.votes.toString(),
      candidateBefore.votes.add(new anchor.BN(1)).toString(),
      "Candidate votes should increase by 1"
    );
  });

  it("Delete poll", async () => {
    const [pollPDA] = PublicKey.findProgramAddressSync(
      [pollId.toArrayLike(Buffer, "le", 8)],
      program.programId
    );
  });
});
