import React, { useMemo, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";

const CandidatesRegister = ({
  pollId,
  pollAddress,
}: {
  pollId: number;
  pollAddress: string;
}) => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [candidateName, setCandidateName] = useState<string>("");
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();
  const { regModal } = useSelector((states: RootState) => states.globalStates);

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
          setOpen(false);

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Candidate</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="candidateName">Candidate Name</Label>
            <Input
              id="candidateName"
              placeholder="Enter candidate name..."
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!program || !publicKey}
          >
            Register
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CandidatesRegister;
