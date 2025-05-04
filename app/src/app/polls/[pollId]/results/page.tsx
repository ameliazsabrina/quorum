"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getReadonlyProvider,
  fetchPollDetails,
  fetchAllCandidates,
} from "../../../../hooks";
import type { RootState } from "../../../../types";
import { useParams, useRouter } from "next/navigation";

import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FaChartBar,
  FaUsers,
  FaTrophy,
  FaArrowLeft,
  FaCalendarAlt,
  FaInfoCircle,
} from "react-icons/fa";
import Link from "next/link";

export default function PollResults() {
  const { pollId } = useParams();
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const program = useMemo(() => getReadonlyProvider(), []);

  const dispatch = useDispatch();
  const { candidates, poll } = useSelector(
    (states: RootState) => states.globalStates
  );

  useEffect(() => {
    if (!program || !pollId) return;

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        await fetchPollDetails(program, pollId as string);
        await fetchAllCandidates(program, pollId as string);
      } catch (err) {
        console.error("Error fetching poll details:", err);
        setError("Failed to fetch poll results. The poll may not exist.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [program, pollId, dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
        <Card className="w-full max-w-4xl bg-slate-800/50 backdrop-blur-sm border-purple-900/50">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2 bg-slate-700" />
            <Skeleton className="h-4 w-1/2 bg-slate-700" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-12 w-full bg-slate-700" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-32 w-full bg-slate-700" />
              <Skeleton className="h-32 w-full bg-slate-700" />
              <Skeleton className="h-32 w-full bg-slate-700" />
            </div>
            <Skeleton className="h-64 w-full bg-slate-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className=" min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
        <Navbar />
        <div className="container mx-auto px-4 py-16 items-center flex flex-col ">
          <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-red-500/50">
            <CardHeader>
              <CardTitle className="text-red-400">Error</CardTitle>
              <CardDescription className="text-gray-300">
                {error ||
                  "Failed to load poll results. The poll may not exist."}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/polls">
                <Button
                  variant="outline"
                  className="border-purple-500 text-white hover:bg-purple-950/50"
                >
                  Return to Polls
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const isPollActive = () => {
    const now = Date.now();
    return now >= poll.startTime && now <= poll.endTime;
  };

  const isPollEnded = () => {
    const now = Date.now();
    return now > poll.endTime;
  };

  const totalVotes = candidates.reduce(
    (sum, candidate) => sum + candidate.votes,
    0
  );

  const getTimeStatus = () => {
    const now = Date.now();
    if (now < poll.startTime) {
      return "Upcoming";
    } else if (now > poll.endTime) {
      return "Ended";
    } else {
      return "Active";
    }
  };

  const getProgressPercentage = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 items-center flex flex-col">
        <div className="w-full max-w-4xl mb-6">
          <Link href={`/polls/${pollId}`}>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-slate-800/50"
            >
              <FaArrowLeft className="mr-2" /> Back to Poll
            </Button>
          </Link>
        </div>

        <Card className="w-full max-w-4xl shadow-lg mb-8 bg-slate-800/50 backdrop-blur-sm border-purple-900/50 hover:border-purple-700/50 transition-all">
          <CardHeader className="bg-gradient-to-r from-slate-800/70 to-purple-900/50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <CardTitle className="text-2xl font-bold text-white break-words">
                    {poll.name}
                  </CardTitle>
                  <Badge
                    className={`${
                      isPollActive()
                        ? "bg-green-500"
                        : isPollEnded()
                        ? "bg-gray-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {getTimeStatus()}
                  </Badge>
                </div>
                <CardDescription className="text-gray-300 break-words">
                  {poll.description}
                </CardDescription>
              </div>
            </div>
            <Progress
              value={getProgressPercentage()}
              className="h-2 mt-4 bg-slate-700"
            />
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <Tabs defaultValue="results" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
                <TabsTrigger
                  value="results"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  <FaChartBar className="mr-2 h-4 w-4" />
                  Results
                </TabsTrigger>
                <TabsTrigger
                  value="candidates"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  <FaUsers className="mr-2 h-4 w-4" />
                  Candidates
                </TabsTrigger>
                <TabsTrigger
                  value="leaderboard"
                  className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                >
                  <FaTrophy className="mr-2 h-4 w-4" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-700/30 border-purple-900/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-gray-300">
                        Total Votes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">
                        {totalVotes}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/30 border-purple-900/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-gray-300">
                        Total Candidates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white">
                        {candidates.length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-700/30 border-purple-900/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg text-gray-300">
                        Poll Duration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-purple-400" />
                        <span className="text-sm text-gray-300">
                          {new Date(poll.startTime).toLocaleDateString()} -{" "}
                          {new Date(poll.endTime).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {candidates.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">
                      Vote Distribution
                    </h3>
                    <div className="space-y-4">
                      {candidates
                        .sort((a, b) => b.votes - a.votes)
                        .map((candidate) => {
                          const percentage =
                            totalVotes > 0
                              ? (candidate.votes / totalVotes) * 100
                              : 0;
                          return (
                            <div
                              key={candidate.publicKey}
                              className="space-y-2"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8 bg-slate-700">
                                    <AvatarFallback className="bg-indigo-700 text-white">
                                      {candidate.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {candidate.name}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-300">
                                  {candidate.votes} votes (
                                  {percentage.toFixed(1)}
                                  %)
                                </div>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2.5">
                                <div
                                  className="bg-indigo-600 h-2.5 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-700/30 rounded-lg border border-dashed border-slate-600">
                    <FaInfoCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">
                      No Candidates Yet
                    </h3>
                    <p className="text-gray-400 mt-2">
                      There are no candidates registered for this poll yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="candidates" className="mt-6">
                {candidates.length > 0 ? (
                  <div className="rounded-md border border-slate-700 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-800">
                        <TableRow className="hover:bg-slate-800/80 border-slate-700">
                          <TableHead className="text-gray-300">
                            Candidate
                          </TableHead>
                          <TableHead className="text-gray-300">Votes</TableHead>
                          <TableHead className="text-gray-300">
                            Percentage
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidates.map((candidate) => (
                          <TableRow
                            key={candidate.publicKey}
                            className="hover:bg-slate-700/50 border-slate-700"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8 bg-slate-700">
                                  <AvatarFallback className="bg-indigo-700 text-white">
                                    {candidate.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{candidate.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.votes}</TableCell>
                            <TableCell>
                              {totalVotes > 0
                                ? (
                                    (candidate.votes / totalVotes) *
                                    100
                                  ).toFixed(1) + "%"
                                : "0%"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-700/30 rounded-lg border border-dashed border-slate-600">
                    <FaInfoCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">
                      No Candidates Yet
                    </h3>
                    <p className="text-gray-400 mt-2">
                      There are no candidates registered for this poll yet.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="leaderboard" className="mt-6">
                {candidates.length > 0 ? (
                  <div className="rounded-md border border-slate-700 overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-800">
                        <TableRow className="hover:bg-slate-800/80 border-slate-700">
                          <TableHead className="text-gray-300">Rank</TableHead>
                          <TableHead className="text-gray-300">
                            Candidate
                          </TableHead>
                          <TableHead className="text-gray-300">Votes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...candidates]
                          .sort((a, b) => b.votes - a.votes)
                          .map((candidate, index) => (
                            <TableRow
                              key={candidate.publicKey}
                              className="hover:bg-slate-700/50 border-slate-700"
                            >
                              <TableCell>
                                <div className="flex items-center">
                                  {index === 0 && (
                                    <FaTrophy className="text-yellow-500 mr-2" />
                                  )}
                                  {index === 1 && (
                                    <FaTrophy className="text-gray-400 mr-2" />
                                  )}
                                  {index === 2 && (
                                    <FaTrophy className="text-amber-700 mr-2" />
                                  )}
                                  {index + 1}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-8 w-8 bg-slate-700">
                                    <AvatarFallback
                                      className={`${
                                        index === 0
                                          ? "bg-yellow-600"
                                          : index === 1
                                          ? "bg-gray-500"
                                          : index === 2
                                          ? "bg-amber-700"
                                          : "bg-indigo-700"
                                      } text-white`}
                                    >
                                      {candidate.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{candidate.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="font-semibold mr-2">
                                    {candidate.votes}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    (
                                    {totalVotes > 0
                                      ? (
                                          (candidate.votes / totalVotes) *
                                          100
                                        ).toFixed(1) + "%"
                                      : "0%"}
                                    )
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-700/30 rounded-lg border border-dashed border-slate-600">
                    <FaInfoCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">
                      No Candidates Yet
                    </h3>
                    <p className="text-gray-400 mt-2">
                      There are no candidates registered for this poll yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
