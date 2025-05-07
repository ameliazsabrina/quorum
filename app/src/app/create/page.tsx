"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { BN } from "@coral-xyz/anchor";
import { createPoll, getCounter, getProvider } from "../../hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaInfoCircle,
  FaPencilAlt,
  FaClock,
} from "react-icons/fa";
import Link from "next/link";

export const runtime = "edge";

export default function CreatePollPage() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [nextCount, setNextCount] = useState<BN>(new BN(0));
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchCounter = async () => {
      if (!program) return;
      try {
        const count = await getCounter(program);
        setNextCount(count.add(new BN(1)));
        setIsInitialized(count.gte(new BN(0)));
      } catch (error) {
        console.error("Error fetching counter:", error);
        toast({
          title: "Error",
          description: "Failed to initialize. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchCounter();
  }, [program, toast]);

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    };

    if (!formData.name.trim()) {
      errors.name = "Poll name is required";
      valid = false;
    }

    if (!formData.description.trim()) {
      errors.description = "Poll description is required";
      valid = false;
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
      valid = false;
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
      valid = false;
    }

    const startTime = new Date(formData.startDate).getTime();
    const endTime = new Date(formData.endDate).getTime();
    const now = Date.now();

    if (startTime < now) {
      errors.startDate = "Start date must be in the future";
      valid = false;
    }

    if (endTime <= startTime) {
      errors.endDate = "End date must be after start date";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!program || !isInitialized || !publicKey) {
      toast({
        title: "Error",
        description:
          "Please connect your wallet and ensure the contract is initialized.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { name, description, startDate, endDate } = formData;

    const startTime = new Date(startDate).getTime() / 1000;
    const endTime = new Date(endDate).getTime() / 1000;

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await createPoll(
            program,
            publicKey,
            nextCount,
            name,
            description,
            startTime,
            endTime
          );

          console.log("Transaction successful:", tx);

          setTimeout(() => {
            router.push("/polls");
          }, 2000);

          resolve(tx as any);
        } catch (error) {
          console.error("Transaction failed:", error);
          reject(error);
        } finally {
          setIsSubmitting(false);
        }
      }),
      {
        loading: "Creating your poll...",
        success: "Poll created successfully! Redirecting to polls page...",
        error: "Failed to create poll. Please try again.",
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 items-center flex flex-col">
        <div className="w-full max-w-2xl mb-6">
          <Link href="/polls">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-slate-800/50"
            >
              <FaArrowLeft className="mr-2" /> Back to Polls
            </Button>
          </Link>
        </div>

        <Card className="w-full max-w-2xl shadow-lg bg-slate-800/50 backdrop-blur-sm border-purple-900/50 hover:border-purple-700/50 transition-all">
          <CardHeader className="bg-gradient-to-r from-slate-800/70 to-purple-900/50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-white text-center">
              Create New Poll
            </CardTitle>
            <CardDescription className="text-gray-300 text-center mt-2">
              Fill out the form below to create a new decentralized poll on the
              Solana blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            {!publicKey && (
              <Alert className="bg-indigo-900/30 border-indigo-500/50 text-white">
                <FaInfoCircle className="h-4 w-4 text-indigo-300" />
                <AlertTitle>Wallet not connected</AlertTitle>
                <AlertDescription>
                  Please connect your wallet to create a poll.
                </AlertDescription>
              </Alert>
            )}

            {publicKey && !isInitialized && (
              <Alert className="bg-amber-900/30 border-amber-500/50 text-white">
                <FaInfoCircle className="h-4 w-4 text-amber-300" />
                <AlertTitle>Contract not initialized</AlertTitle>
                <AlertDescription>
                  Please initialize the contract from the polls page before
                  creating a poll.
                </AlertDescription>
              </Alert>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-gray-200 flex items-center"
                >
                  <FaPencilAlt className="mr-2 text-purple-400" /> Poll Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter poll name..."
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600 focus:border-purple-500 text-white placeholder:text-gray-400"
                />
                {formErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-200 flex items-center"
                >
                  <FaInfoCircle className="mr-2 text-purple-400" /> Poll
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe the purpose of this poll..."
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600 focus:border-purple-500 text-white placeholder:text-gray-400 min-h-[100px]"
                />
                {formErrors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="startDate"
                    className="text-gray-200 flex items-center"
                  >
                    <FaCalendarAlt className="mr-2 text-purple-400" /> Start
                    Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    id="startDate"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 focus:border-purple-500 text-white"
                  />
                  {formErrors.startDate && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="endDate"
                    className="text-gray-200 flex items-center"
                  >
                    <FaClock className="mr-2 text-purple-400" /> End Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    id="endDate"
                    required
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600 focus:border-purple-500 text-white"
                  />
                  {formErrors.endDate && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.endDate}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={!program || !isInitialized || isSubmitting}
              >
                {isSubmitting ? "Creating Poll..." : "Create Poll"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
