"use client";

import { useWeb3 } from "../context/Web3Context";
import Link from "next/link";
import { ScanLine, ShieldCheck, User, LayoutDashboard, Wallet, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const { account, connectWallet, isLoading } = useWeb3();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      
      {/* --- Navbar --- */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2 rounded-lg">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            TrustChain
          </span>
        </div>

        {!account ? (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all border border-white/5 font-medium text-sm"
          >
            <Wallet size={16} /> {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-purple-400 text-sm font-mono">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
        )}
      </nav>

      {/* --- Hero Section --- */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-4 uppercase tracking-wider">
            <Sparkles size={12} /> Blockchain Verified
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500 tracking-tight">
            Verify. Claim. <br /> Own Authenticity.
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Secure your product's digital identity and warranty on the blockchain. 
            Scan to verify, claim ownership, and manage your collection.
          </p>
        </div>

        {/* --- Action Grid --- */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: Consumer Verify (Primary Action) */}
          <Link href="/verify" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative h-full bg-black/90 backdrop-blur-xl border border-white/10 p-8 rounded-[1.4rem] flex flex-col items-center text-center hover:bg-white/5 transition-all">
              <div className="bg-blue-500/20 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <ScanLine size={40} className="text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Verify Product</h3>
              <p className="text-slate-400 text-sm mb-6">Scan QR code to verify authenticity and check product history.</p>
              <span className="mt-auto flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:gap-3 transition-all">
                Start Scanning <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Card 2: My Profile (New Feature) */}
          <Link href="/profile" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative h-full bg-black/90 backdrop-blur-xl border border-white/10 p-8 rounded-[1.4rem] flex flex-col items-center text-center hover:bg-white/5 transition-all">
              <div className="bg-purple-500/20 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <User size={40} className="text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2">My Collection</h3>
              <p className="text-slate-400 text-sm mb-6">View your claimed products and manage digital warranties.</p>
              <span className="mt-auto flex items-center gap-2 text-purple-400 text-sm font-bold group-hover:gap-3 transition-all">
                View Profile <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Card 3: Admin Dashboard */}
          <Link href="/admin" className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-600 to-slate-400 rounded-3xl blur opacity-20 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative h-full bg-black/90 backdrop-blur-xl border border-white/10 p-8 rounded-[1.4rem] flex flex-col items-center text-center hover:bg-white/5 transition-all">
              <div className="bg-slate-500/20 p-4 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-500">
                <LayoutDashboard size={40} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Manufacturer</h3>
              <p className="text-slate-400 text-sm mb-6">Register new products and track supply chain analytics.</p>
              <span className="mt-auto flex items-center gap-2 text-slate-400 text-sm font-bold group-hover:gap-3 transition-all">
                Admin Access <ArrowRight size={16} />
              </span>
            </div>
          </Link>

        </div>

        {/* --- Footer Info --- */}
        <div className="mt-20 text-center border-t border-white/5 pt-10">
          <p className="text-slate-500 text-sm">
            Powered by Ethereum Sepolia Testnet & IPFS Storage.(Demo Purpose only)
            
          </p>
        </div>
      </main>
    </div>
  );
}