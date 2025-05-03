"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  getReadonlyProvider,
  fetchPollDetails,
  fetchAllCandidates,
} from "../../../hooks";
import { RootState } from "../../../store/store";
import { useParams } from "next/navigation";
import RegCandidate from "../../../components/CandidatesRegist";
import {
  FaRegEdit,
  FaClock,
  FaUsers,
  FaCalendarAlt,
  FaInfoCircle,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { DeletePollButton } from "@/components/DeletePollButton";

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
      <div className="flex flex-col items-center justify-center min-h-screen p-4 ">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Separator />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Poll Not Found</CardTitle>
            <CardDescription>
              The requested poll could not be found.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.history.back()}>
              Return to Polls
            </Button>
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
    <div className="flex flex-col items-center min-h-screen p-4 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white ">
      <Card className="w-full max-w-4xl shadow-lg mb-8">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <CardTitle className="text-3xl font-bold text-indigo-900">
                {poll.name}
              </CardTitle>
              {getPollStatusBadge()}
            </div>
            <div className="flex items-center">
              <DeletePollButton pollId={poll.id} />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-base font-medium text-indigo-600">
                    <FaClock className="mr-2" />
                    {timeRemaining}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {isPollActive()
                      ? "Running poll"
                      : isPollUpcoming()
                      ? "Poll starts soon"
                      : "Poll has concluded"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Progress value={progressPercentage} className="h-2 mb-4" />
          <CardDescription className="text-lg mt-2 text-gray-700">
            {poll.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Start Time
                    </p>
                    <p className="text-base font-medium">
                      {new Date(poll.startTime).toLocaleDateString(undefined, {
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

            <Card className="border-0 shadow-sm bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <FaClock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      End Time
                    </p>
                    <p className="text-base font-medium">
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

          <Separator className="my-6" />

          <div className="flex flex-col">
            <div className="flex items-center mb-4 space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <FaUsers className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">
                Candidates
                <span className="ml-2 text-base text-gray-500">
                  ({candidates.length} registered)
                </span>
              </h3>
            </div>

            {publicKey && isPollActive() && (
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-indigo-900">
                      Want to participate?
                    </h3>
                    <p className="text-sm text-gray-700">
                      Register now to become a candidate in this poll
                    </p>
                  </div>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
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
              <CandidateList
                candidates={candidates}
                pollAddress={poll.publicKey}
                pollId={poll.id}
              />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <FaInfoCircle className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">
                  No Candidates Yet
                </h3>
                <p className="text-gray-500 mt-2">
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

      {pollId && <RegCandidate pollId={poll.id} pollAddress={poll.publicKey} />}
    </div>
  );
}
