import React, { useEffect, useMemo, useState } from "react";
import { Candidate } from "../types";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchAllCandidates, getProvider, hasUserVoted, vote } from "../hooks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Props {
  candidates: Candidate[];
  pollAddress: string;
  pollId: number;
}

const CandidatesList = ({ candidates, pollAddress, pollId }: Props) => {
  const [voted, setVoted] = useState<boolean>(false);
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { toast } = useToast();

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  );

  const fetchVotingStatus = async () => {
    const status = await hasUserVoted(program!, publicKey!, pollId);
    setVoted(status);
  };

  useEffect(() => {
    if (!program || !publicKey) return;

    fetchVotingStatus();
  }, [program, publicKey, candidates]);

  const handleVote = async (candidate: Candidate) => {
    if (!program || !publicKey || voted) return;

    toast({
      title: "Candidates list:",
      description: "Select one of the candidates to vote.",
    });

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await vote(
            program!,
            publicKey!,
            candidate.pollId,
            candidate.cid
          );

          await fetchAllCandidates(program, pollAddress);
          await fetchVotingStatus();

          console.log(tx);
          resolve(tx as any);
        } catch (error) {
          console.error("Transaction failed:", error);
          reject(error);
        }
      }),
      {
        loading: "Approve transaction...",
        success: "Transaction successful 👌",
        error: "Encountered error 🤯",
      }
    );
  };

  return (
    <div className="bg-slate-800/70 border border-purple-500/30 rounded-xl shadow-lg p-4 md:p-6 w-full space-y-4">
      <div className="space-y-4">
        {candidates.map((candidate) => (
          <div
            key={candidate.publicKey}
            className="flex flex-col sm:flex-row justify-between items-center border-b border-slate-700 last:border-none pb-4 last:pb-0 gap-3"
          >
            <span className="text-white font-medium text-center sm:text-left">
              {candidate.name}
            </span>
            <Button
              onClick={() => handleVote(candidate)}
              className={
                voted
                  ? "bg-slate-700 text-gray-300"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }
              disabled={voted || !publicKey}
            >
              {voted ? "Voted" : "Vote"}{" "}
              <span className="font-semibold ml-1">{candidate.votes}</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidatesList;
