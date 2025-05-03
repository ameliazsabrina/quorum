"use client";

import { NextPage } from "next";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { BN } from "@coral-xyz/anchor";
import { createPoll, getCounter, getProvider } from "../../hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Page: NextPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const [nextCount, setNextCount] = useState<BN>(new BN(0));
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
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

  useEffect(() => {
    const fetchCounter = async () => {
      if (!program) return;
      const count = await getCounter(program);
      setNextCount(count.add(new BN(1)));
      setIsInitialized(count.gte(new BN(0)));
    };

    fetchCounter();
  }, [program, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !isInitialized) return;

    const { name, description, startDate, endDate } = formData;

    const startTime = new Date(startDate).getTime() / 1000;
    const endTime = new Date(endDate).getTime() / 1000;

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await createPoll(
            program!,
            publicKey!,
            nextCount,
            name,
            description,
            startTime,
            endTime
          );

          setFormData({
            name: "",
            description: "",
            startDate: "",
            endDate: "",
          });

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
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Poll
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Poll Name</Label>
              <Input
                id="name"
                placeholder="Enter poll name..."
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Poll Description</Label>
              <Input
                id="description"
                placeholder="Briefly describe the purpose of this poll..."
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="datetime-local"
                id="startDate"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="datetime-local"
                id="endDate"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!program || !isInitialized}
            >
              Create Poll
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
