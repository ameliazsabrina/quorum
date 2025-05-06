"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@solana/wallet-adapter-react";
import { useDispatch } from "react-redux";
import { deletePoll } from "@/hooks/index";
import { getProvider } from "@/hooks/index";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface DeletePollButtonProps {
  pollId: number;
  onSuccess?: () => void;
}

export function DeletePollButton({ pollId, onSuccess }: DeletePollButtonProps) {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const handleDelete = async () => {
    if (!publicKey) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      const program = getProvider(publicKey, signTransaction, sendTransaction);

      toast({
        title: "Deleting poll...",
        description: "Please approve the transaction",
      });

      await toast.promise(deletePoll(program!, publicKey, pollId), {
        loading: "Deleting poll...",
        success: "Poll deleted successfully",
        error: "Failed to delete poll",
      });

      if (onSuccess) {
        onSuccess();
      }
      router.push("/polls");
    } catch (error) {
      console.error("Error deleting poll:", error);
      toast({
        title: "Error",
        description: "Failed to delete poll",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleDelete}
      variant="destructive"
      className="flex items-center gap-2"
    >
      <FaTrash />
      Delete Poll
    </Button>
  );
}
