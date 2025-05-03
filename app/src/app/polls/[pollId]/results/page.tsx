"use client";

import React, { useEffect, useMemo } from "react";
import {
  getReadonlyProvider,
  fetchPollDetails,
  fetchAllCandidates,
} from "../../../../hooks";
import { RootState } from "../../../../types";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FaChartBar, FaUsers, FaTrophy } from "react-icons/fa";

export default function PollResults() {
  const { pollId } = useParams();
  const { publicKey } = useWallet();

  const program = useMemo(() => getReadonlyProvider(), []);

  const dispatch = useDispatch();
  const { candidates, poll } = useSelector(
    (states: RootState) => states.globalStates
  );

  useEffect(() => {
    if (!program || !pollId) return;

    const fetchDetails = async () => {
      await fetchPollDetails(program, pollId as string);
      await fetchAllCandidates(program, pollId as string);
    };

    fetchDetails();
  }, [program, pollId, dispatch]);

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Fetching poll results</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isPollActive = () => {
    const now = Date.now();
    return now >= poll.startTime && now <= poll.endTime;
  };

  const totalVotes = candidates.reduce(
    (sum, candidate) => sum + candidate.votes,
    0
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{poll.name}</CardTitle>
              <CardDescription className="mt-2">
                {poll.description}
              </CardDescription>
            </div>
            <Badge variant={isPollActive() ? "default" : "secondary"}>
              {isPollActive() ? "Active" : "Ended"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="results">
                <FaChartBar className="mr-2 h-4 w-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="candidates">
                <FaUsers className="mr-2 h-4 w-4" />
                Candidates
              </TabsTrigger>
              <TabsTrigger value="leaderboard">
                <FaTrophy className="mr-2 h-4 w-4" />
                Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Votes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{totalVotes}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Candidates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {candidates.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={isPollActive() ? "default" : "secondary"}>
                      {isPollActive() ? "Active" : "Ended"}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="candidates">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.publicKey}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarFallback>
                              {candidate.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{candidate.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{candidate.votes}</TableCell>
                      <TableCell>
                        {totalVotes > 0
                          ? ((candidate.votes / totalVotes) * 100).toFixed(1) +
                            "%"
                          : "0%"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Votes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...candidates]
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate, index) => (
                      <TableRow key={candidate.publicKey}>
                        <TableCell>
                          <div className="flex items-center">
                            {index === 0 && (
                              <FaTrophy className="text-yellow-500 mr-2" />
                            )}
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar>
                              <AvatarFallback>
                                {candidate.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>{candidate.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{candidate.votes}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
