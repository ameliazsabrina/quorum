import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setRegModal } from "../store/states/globalStates";
import {
  fetchAllCandidates,
  fetchPollDetails,
  getProvider,
  registerCandidate,
} from "../hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const RegCandidate = ({
  pollId,
  pollAddress,
}: {
  pollId: number;
  pollAddress: string;
}) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [candidateName, setCandidateName] = useState<string>("");

  const dispatch = useDispatch();
  const { regModal } = useSelector((states: RootState) => states.globalStates);

  // Determine if modal is open based on Redux state
  const isOpen = regModal === "scale-100";

  // Handle modal close
  const handleOpenChange = (open: boolean) => {
    dispatch(setRegModal(open ? "scale-100" : "scale-0"));
  };

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !publicKey || !candidateName) return;

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await registerCandidate(
            program!,
            publicKey!,
            pollId,
            candidateName
          );

          setCandidateName("");
          dispatch(setRegModal("scale-0")); // Close modal after success

          await fetchPollDetails(program, pollAddress);
          await fetchAllCandidates(program, pollAddress);

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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-w-[90%] mx-auto bg-slate-800 text-white border-purple-500">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Register Candidate
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="candidateName" className="text-gray-200">
              Candidate Name
            </Label>
            <Input
              id="candidateName"
              placeholder="Enter candidate name..."
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="bg-slate-700 text-white border-slate-600 focus:border-purple-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={!program || !publicKey}
          >
            Register
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegCandidate;
