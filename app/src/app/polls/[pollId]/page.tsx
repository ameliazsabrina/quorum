"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getReadonlyProvider,
  fetchPollDetails,
  fetchAllCandidates,
} from "../../../hooks";
import type { RootState } from "../../../store/store";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import RegCandidate from "../../../components/CandidatesRegist";
import {
  FaRegEdit,
  FaClock,
  FaUsers,
  FaCalendarAlt,
  FaInfoCircle,
  FaArrowLeft,
  FaChartBar,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useWallet } from "@solana/wallet-adapter-react";
import CandidateList from "../../../components/CandidatesList";
import { setRegModal } from "../../../store/states/globalStates";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DeletePollButton } from "@/components/DeletePollButton";
import Link from "next/link";

export default function PollDetails() {
  const { pollId } = useParams();
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const { toast } = useToast();

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
        setError(null);
        await fetchPollDetails(program, pollId as string);
        await fetchAllCandidates(program, pollId as string);
      } catch (err) {
        console.error("Error fetching poll details:", err);
        setError("Failed to fetch poll details. The poll may not exist.");
        toast({
          title: "Error",
          description: "Failed to fetch poll details. The poll may not exist.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [program, pollId, dispatch, toast]);

  useEffect(() => {
    if (!poll) return;

    const updateTimeAndProgress = () => {
      const now = Date.now();
      const { startTime, endTime } = poll;

      const totalDuration = endTime - startTime;
      const elapsedTime = now - startTime;

      let progress = 0;
      if (now < startTime) {
        progress = 0;
      } else if (now > endTime) {
        progress = 100;
      } else {
        progress = Math.min(
          100,
          Math.max(0, (elapsedTime / totalDuration) * 100)
        );
      }
      setProgressPercentage(progress);

      let timeString = "";
      if (now < startTime) {
        const timeToStart = startTime - now;
        const days = Math.floor(timeToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeToStart % (1000 * 60 * 60)) / (1000 * 60)
        );
        timeString = `Starts in ${
          days > 0 ? `${days}d ` : ""
        }${hours}h ${minutes}m`;
      } else if (now > endTime) {
        timeString = "Poll has ended";
      } else {
        const timeToEnd = endTime - now;
        const days = Math.floor(timeToEnd / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeToEnd % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeToEnd % (1000 * 60 * 60)) / (1000 * 60)
        );
        timeString = `Ends in ${
          days > 0 ? `${days}d ` : ""
        }${hours}h ${minutes}m`;
      }
      setTimeRemaining(timeString);
    };

    updateTimeAndProgress();
    const intervalId = setInterval(updateTimeAndProgress, 60000);

    return () => clearInterval(intervalId);
  }, [poll]);

  const isPollActive = () => {
    if (!poll) return false;
    const now = Date.now();
    return now >= poll.startTime && now <= poll.endTime;
  };

  const isPollUpcoming = () => {
    if (!poll) return false;
    const now = Date.now();
    return now < poll.startTime;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
        <Card className="w-full max-w-3xl bg-slate-800/50 backdrop-blur-sm border-purple-900/50">
          <CardHeader className="bg-slate-800/70">
            <Skeleton className="h-8 w-3/4 mb-2 bg-slate-700" />
            <Skeleton className="h-4 w-1/2 bg-slate-700" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full bg-slate-700" />
              <Skeleton className="h-16 w-full bg-slate-700" />
            </div>
            <Separator className="bg-slate-700" />
            <Skeleton className="h-6 w-1/3 bg-slate-700" />
            <Skeleton className="h-10 w-full bg-slate-700" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full bg-slate-700" />
              <Skeleton className="h-24 w-full bg-slate-700" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
        <Navbar />
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
            <CardDescription className="text-gray-300">{error}</CardDescription>
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
    );
  }

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900">
        <Navbar />
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-purple-900/50">
          <CardHeader>
            <CardTitle className="text-white">Poll Not Found</CardTitle>
            <CardDescription className="text-gray-300">
              The requested poll could not be found.
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
    );
  }

  const getPollStatusBadge = () => {
    if (isPollUpcoming()) {
      return <Badge variant="secondary">Upcoming</Badge>;
    } else if (isPollActive()) {
      return (
        <Badge variant="default" className="bg-green-500">
          Active
        </Badge>
      );
    } else {
      return <Badge variant="secondary">Ended</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 items-center flex flex-col">
        <div className="w-full max-w-4xl mb-6">
          <Link href="/polls">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-slate-800/50"
            >
              <FaArrowLeft className="mr-2" /> Back to Polls
            </Button>
          </Link>
        </div>

        <Card className="w-full max-w-4xl shadow-lg mb-8 bg-slate-800/50 backdrop-blur-sm border-purple-900/50 hover:border-purple-700/50 transition-all">
          <CardHeader className="bg-gradient-to-r from-slate-800/70 to-purple-900/50 rounded-t-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <CardTitle className="text-3xl font-bold text-white break-words">
                  {poll.name}
                </CardTitle>
                {getPollStatusBadge()}
              </div>
              <div className="flex items-center">
                <DeletePollButton pollId={poll.id} />
              </div>
            </div>
            <div className="flex items-center text-base font-medium text-purple-300 mb-2">
              <FaClock className="mr-2" />
              {timeRemaining}
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 mb-4 bg-slate-700"
            />
            <CardDescription className="text-lg mt-2 text-gray-300">
              {poll.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm bg-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-900/50 rounded-full">
                      <FaCalendarAlt className="h-5 w-5 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-300">
                        Start Time
                      </p>
                      <p className="text-base font-medium text-white">
                        {new Date(poll.startTime).toLocaleDateString(
                          undefined,
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-slate-700/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-900/50 rounded-full">
                      <FaClock className="h-5 w-5 text-purple-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-300">
                        End Time
                      </p>
                      <p className="text-base font-medium text-white">
                        {new Date(poll.endTime).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {!isPollActive() && !isPollUpcoming() && (
              <Link href={`/polls/${pollId}/results`}>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 mt-4">
                  <span className="flex items-center justify-center gap-2">
                    View Results
                    <FaChartBar />
                  </span>
                </Button>
              </Link>
            )}

            <Separator className="my-6 bg-slate-700/50" />

            <div className="flex flex-col">
              <div className="flex items-center mb-4 space-x-2">
                <div className="p-2 bg-purple-900/50 rounded-full">
                  <FaUsers className="h-5 w-5 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  Candidates
                  <span className="ml-2 text-base text-gray-400">
                    ({candidates.length} registered)
                  </span>
                </h3>
              </div>

              {publicKey && isPollActive() && (
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-4 rounded-lg mb-6 border border-indigo-500/30">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white">
                        Want to participate?
                      </h3>
                      <p className="text-sm text-gray-300">
                        Register now to become a candidate in this poll
                      </p>
                    </div>
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                      onClick={() => dispatch(setRegModal("scale-100"))}
                    >
                      <span className="flex items-center justify-center gap-2">
                        Register as Candidate
                        <FaRegEdit />
                      </span>
                    </Button>
                  </div>
                </div>
              )}

              {candidates.length > 0 ? (
                <div className="flex flex-col gap-4 items-center">
                  <CandidateList
                    candidates={candidates}
                    pollAddress={poll.publicKey}
                    pollId={poll.id}
                  />
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-700/30 rounded-lg border border-dashed border-slate-600">
                  <FaInfoCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300">
                    No Candidates Yet
                  </h3>
                  <p className="text-gray-400 mt-2">
                    {isPollActive()
                      ? "Be the first to register as a candidate!"
                      : isPollUpcoming()
                      ? "Candidate registration will open when the poll starts."
                      : "This poll ended with no registered candidates."}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {pollId && poll && (
          <RegCandidate
            pollId={parseInt(poll.id.toString())}
            pollAddress={poll.publicKey}
          />
        )}
      </div>
    </div>
  );
}
