"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { motion } from "framer-motion";
import {
  Vote,
  Shield,
  BarChart3,
  ChevronRight,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 text-white">
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/90 backdrop-blur-md py-3 shadow-lg"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Quorum Logo" width={100} height={100} />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-300 hover:text-white transition-colors"
            >
              How it Works
            </Link>
          </nav>

          <div className="hidden md:block">
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !px-6 !py-2 !rounded-lg !transition-all !shadow-md hover:!shadow-lg" />
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                href="#features"
                className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              >
                How it Works
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              >
                Testimonials
              </Link>
              <Link
                href="#faq"
                className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              >
                FAQ
              </Link>
              <div className="py-2">
                <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !px-6 !py-2 !rounded-lg !transition-all !w-full !justify-center" />
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="pt-32 pb-20 relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-32">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4 px-4 py-1 bg-purple-900/50 backdrop-blur-sm rounded-full border border-purple-700/50">
              <span className="text-purple-300 text-sm font-medium">
                Powered by Solana Blockchain
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-indigo-200">
              Decentralized Voting for the Future
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Create, participate, and manage polls with complete transparency
              and security on Solana's lightning-fast blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!publicKey ? (
                <>
                  <Button
                    variant="outline"
                    className="border-purple-500 text-white hover:bg-purple-950/50 px-8 py-4 text-lg rounded-lg"
                    onClick={() => router.push("/polls")}
                  >
                    Learn More <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => router.push("/polls")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    Go to Polls
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-500 text-white hover:bg-purple-950/50 px-8 py-6 text-lg rounded-lg"
                  >
                    Create New Poll <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4 px-4 py-1 bg-purple-900/50 backdrop-blur-sm rounded-full border border-purple-700/50">
              <span className="text-purple-300 text-sm font-medium">
                Why Choose Quorum
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built with the latest blockchain technology to provide a secure,
              transparent, and efficient voting experience.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={item}>
              <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-900/50 hover:border-purple-700/50 transition-all hover:shadow-lg hover:shadow-purple-900/20 h-full">
                <CardHeader className="pb-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4">
                    <Vote className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">
                    Decentralized Voting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Create and participate in polls with complete transparency.
                    Every vote is recorded on the Solana blockchain, ensuring
                    immutability and verifiability.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-900/50 hover:border-purple-700/50 transition-all hover:shadow-lg hover:shadow-purple-900/20 h-full">
                <CardHeader className="pb-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Secure & Trustless</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Built on Solana's secure blockchain. Your votes are
                    immutable and verifiable by anyone, eliminating the need for
                    trusted third parties.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="bg-slate-800/50 backdrop-blur-sm border-purple-900/50 hover:border-purple-700/50 transition-all hover:shadow-lg hover:shadow-purple-900/20 h-full">
                <CardHeader className="pb-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Real-time Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    View poll results in real-time with detailed analytics and
                    candidate performance metrics. Make data-driven decisions
                    with confidence.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block mb-4 px-4 py-1 bg-purple-900/50 backdrop-blur-sm rounded-full border border-purple-700/50">
              <span className="text-purple-300 text-sm font-medium">
                Simple Process
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-4">How Quorum Works</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Getting started with decentralized voting is easier than you
              think.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Connect Wallet</h3>
              <p className="text-gray-300">
                Connect your Solana wallet to access the platform. We support
                Phantom, Solflare, and other popular wallets.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Create or Join Poll</h3>
              <p className="text-gray-300">
                Create your own poll or browse existing ones. Set parameters
                like duration, eligibility, and options.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Vote & Track Results</h3>
              <p className="text-gray-300">
                Cast your vote securely and track results in real-time. All
                votes are recorded on the blockchain for transparency.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div>
              <div className="flex justify-center items-center gap-2 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Quorum Logo"
                  width={100}
                  height={100}
                />
              </div>
              <p className="text-gray-400 mb-4 text-center">
                A decentralized voting platform built on Solana. Secure,
                transparent, and efficient.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-center items-center">
            <p className="text-gray-400 text-sm">
              Quorum made for practicing Solana Blockchain by @makantersera
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
