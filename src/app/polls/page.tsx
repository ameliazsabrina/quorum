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
import Navbar from "@/components/Navbar";
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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaPlus, FaClock, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export const runtime = "edge";

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const programReadOnly = useMemo(() => getReadonlyProvider(), []);
  const { toast } = useToast();

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  );

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const pollsData = await fetchAllPolls(programReadOnly);
      setPolls(pollsData as any);
      const count = await getCounter(programReadOnly);
      setIsInitialized(count.gte(new BN(0)));
    } catch (error) {
      console.error("Error fetching polls:", error);
      toast({
        title: "Error",
        description: "Failed to fetch polls. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const getPollStatus = (poll: Poll) => {
    const now = Date.now();
    if (now < poll.startTime) {
      return "upcoming";
    } else if (now > poll.endTime) {
      return "ended";
    } else {
      return "active";
    }
  };

  const getProgressPercentage = (poll: Poll) => {
    const now = Date.now();
    const totalDuration = poll.endTime - poll.startTime;
    const elapsedTime = now - poll.startTime;

    if (now < poll.startTime) {
      return 0;
    } else if (now > poll.endTime) {
      return 100;
    } else {
      return Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100));
    }
  };

  const getTimeRemaining = (poll: Poll) => {
    const now = Date.now();
    if (now < poll.startTime) {
      const timeToStart = poll.startTime - now;
      const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      return `Starts in ${days > 0 ? `${days}d ` : ""}${hours}h`;
    } else if (now > poll.endTime) {
      return "Ended";
    } else {
      const timeToEnd = poll.endTime - now;
      const days = Math.floor(timeToEnd / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      return `Ends in ${days > 0 ? `${days}d ` : ""}${hours}h`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">All Polls</h1>
            <p className="text-gray-300">
              Browse and participate in decentralized polls on Solana
            </p>
          </div>
          {publicKey && isInitialized && (
            <Link href="/create">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <FaPlus className="mr-2" />
                Create Poll
              </Button>
            </Link>
          )}
        </div>

        {!isInitialized && publicKey && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-900/50 mb-8">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold mb-4">
                Initialize Contract
              </h3>
              <p className="text-gray-300 mb-6">
                You need to initialize the contract before creating or
                participating in polls.
              </p>
              <Button
                onClick={handleInit}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Initialize Contract
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="bg-slate-800/50 backdrop-blur-sm border-purple-900/50"
              >
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-slate-700" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full bg-slate-700" />
                  <Skeleton className="h-4 w-2/3 bg-slate-700" />
                  <Skeleton className="h-4 w-1/2 bg-slate-700" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full bg-slate-700" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && isInitialized && polls.length === 0 && (
          <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-900/50">
            <CardContent className="py-8 text-center">
              <p className="text-xl text-gray-300 mb-4">
                No polls available yet.
              </p>
              {publicKey && (
                <Link href="/create" className="mt-4 inline-block">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Create Your First Poll
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll) => {
              const status = getPollStatus(poll);
              return (
                <Card
                  key={poll.publicKey}
                  className="bg-slate-800/50 backdrop-blur-sm border-purple-900/50 hover:border-purple-700/50 transition-all hover:shadow-lg hover:shadow-purple-900/20"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl text-white">
                        {poll.name || "Unnamed Poll"}
                      </CardTitle>
                      <Badge
                        className={`${
                          status === "active"
                            ? "bg-green-500"
                            : status === "upcoming"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {status === "active"
                          ? "Active"
                          : status === "upcoming"
                          ? "Upcoming"
                          : "Ended"}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-300">
                      {poll.description}
                    </CardDescription>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{getTimeRemaining(poll)}</span>
                        <span>
                          {Math.round(getProgressPercentage(poll))}% complete
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(poll)}
                        className="h-1"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 py-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center text-gray-300 text-sm">
                        <FaCalendarAlt className="mr-2 text-purple-400" />
                        <span>
                          {new Date(poll.startTime).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-300 text-sm">
                        <FaClock className="mr-2 text-purple-400" />
                        <span>
                          {new Date(poll.endTime).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-300 text-sm">
                      <FaUsers className="mr-2 text-purple-400" />
                      <span>
                        {poll.candidates} candidate
                        {poll.candidates !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/polls/${poll.publicKey}`}
                      className="block w-full"
                    >
                      <Button
                        variant="default"
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        View Poll
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
