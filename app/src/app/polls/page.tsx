"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  fetchAllPolls,
  getCounter,
  getProvider,
  getReadonlyProvider,
  initialize,
} from "../../hooks";
import Link from "next/link";
import { Poll } from "../../types";
import { BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import { FaPlus } from "react-icons/fa";

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const programReadOnly = useMemo(() => getReadonlyProvider(), []);
  const { toast } = useToast();

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  );

  const fetchData = async () => {
    fetchAllPolls(programReadOnly).then((data) => setPolls(data as any));
    const count = await getCounter(programReadOnly);
    setIsInitialized(count.gte(new BN(0)));
  };

  useEffect(() => {
    if (!programReadOnly) return;
    fetchData();
  }, [programReadOnly]);

  const handleInit = async () => {
    if (isInitialized && !!publicKey) return;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!program || !publicKey) {
      await toast({
        title: "Error",
        description: "Please make sure your wallet is properly connected.",
        variant: "destructive",
      });
      return;
    }

    await toast({
      title: "Approve transaction...",
      description: "Please approve the transaction to initialize the contract.",
    });

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await initialize(program, publicKey);
          console.log(tx);

          await new Promise((resolve) => setTimeout(resolve, 1000));

          await fetchData();
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
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">All Polls</h1>
          {publicKey && isInitialized && (
            <Link href="/polls/create">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <FaPlus className="mr-2" />
                Create Poll
              </Button>
            </Link>
          )}
        </div>

        {!isInitialized && publicKey && (
          <div className="text-center py-8">
            <Button
              onClick={handleInit}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Initialize Contract
            </Button>
          </div>
        )}

        {isInitialized && polls.length === 0 && (
          <Card className="bg-indigo-800/50 border-indigo-700 text-white">
            <CardContent className="py-8 text-center">
              <p className="text-xl">No polls available yet.</p>
              {publicKey && (
                <Link href="/polls/create" className="mt-4 inline-block">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                    Create Your First Poll
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <Card
              key={poll.publicKey}
              className="bg-indigo-800/50 border-indigo-700"
            >
              <CardHeader>
                <CardTitle className="text-white">
                  {poll.description.length > 20
                    ? poll.description.slice(0, 25) + "..."
                    : poll.description}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-gray-300">
                  <p>
                    <span className="font-semibold">Starts:</span>{" "}
                    {new Date(poll.startTime).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Ends:</span>{" "}
                    {new Date(poll.endTime).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">Candidates:</span>{" "}
                    {poll.candidates}
                  </p>
                </div>
                <Link
                  href={`/polls/${poll.publicKey}`}
                  className="block w-full"
                >
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    View Poll
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
