"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { FaPoll, FaUser } from "react-icons/fa";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const { publicKey, disconnect } = useWallet();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-indigo-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold">
              <Image
                src="/logo.svg"
                alt="Quorum Logo"
                width={100}
                height={100}
              />
            </Link>
            {/* {publicKey && (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/polls"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
                    isActive("/polls")
                      ? "bg-purple-700"
                      : "hover:bg-purple-800/50"
                  }`}
                >
                  <FaPoll />
                  <span>Polls</span>
                </Link>
              </div>
            )} */}
          </div>

          <div className="flex items-center space-x-4">
            {publicKey ? (
              <>
                <div className="hidden md:flex items-center space-x-2 bg-purple-800/50 px-4 py-2 rounded-full">
                  <FaUser />
                  <span className="text-sm">
                    {publicKey.toString().slice(0, 4)}...
                    {publicKey.toString().slice(-4)}
                  </span>
                </div>
                <Button
                  onClick={() => disconnect()}
                  variant="outline"
                  className="bg-transparent border-purple-500 text-white hover:bg-purple-800/50"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
