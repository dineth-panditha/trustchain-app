"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import { ShieldCheck, ShieldAlert, ArrowLeft, Loader2, Camera, UserCheck, Box, AlertTriangle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function VerifyPage() {

  const { account, verifyProduct, claimProduct, reportFake, isLoading } = useWeb3();
  const router = useRouter();

  const [result, setResult] = useState<any>(null);
  const [scanned, setScanned] = useState(false);
  const [isFake, setIsFake] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [scannedSerial, setScannedSerial] = useState(""); 

  useEffect(() => {
    const checkAuth = () => {
      if (!account) {
        toast.error("Please connect wallet!", { id: "auth-toast", icon: "🔐" });
        router.push("/");
      } else {
        setIsValidating(false);
      }
    };
    setTimeout(checkAuth, 1000);
  }, [account, router]);

  const handleScan = async (data: any) => {
    if (data && data.length > 0 && !scanned) {
      const serial = data[0].rawValue;
      setScanned(true);
      setScannedSerial(serial); 
      setResult(null); 
      
      const loadingToast = toast.loading("Verifying on Blockchain...");
      
      try {
        const product = await verifyProduct(serial);
        toast.dismiss(loadingToast);

        if (product && product.isRegistered) {
          setResult({
            name: product.name,
            manufacturer: product.manufacturer,
            imageHash: product.imageHash,
            timestamp: Number(product.timestamp),
            serial: serial,
            isSold: product.isSold,
            currentOwner: product.currentOwner
          });
          setIsFake(false);
          toast.success("Authentic Product!");
        } else {
          setIsFake(true);
          toast.error("Product Not Found!");
        }
      } catch (error) {
        toast.dismiss(loadingToast);
        setScanned(false);
        toast.error("Verification Error");
      }
    }
  };

  const handleClaim = async () => {
    if (result) {
      const success = await claimProduct(result.serial);
      if (success) {
        setResult({ ...result, isSold: true, currentOwner: account });
      }
    }
  };


  const handleReport = async () => {
    if (scannedSerial) {
      await reportFake(scannedSerial);
     
      setTimeout(() => {
        setScanned(false);
        setIsFake(false);
        setScannedSerial("");
      }, 2000);
    }
  };

  if (isValidating || !account) {
    return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white"><Loader2 className="animate-spin text-purple-500 w-10 h-10"/></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8"><ArrowLeft size={20} /> Back</Link>

      <div className="max-w-xl mx-auto">
        {!scanned ? (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2.5rem] blur opacity-25"></div>
            <div className="relative glass-panel p-4 rounded-[2rem] overflow-hidden border border-white/10">
              <div className="rounded-2xl overflow-hidden aspect-square">
                <Scanner onScan={handleScan} allowMultiple={false} scanDelay={2000} />
              </div>
              <p className="text-center py-4 text-slate-400 flex justify-center gap-2"><Camera size={18} /> Scanning Active</p>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isFake ? (
              // --- Fake Product & Reporting UI ---
              <div className="glass-panel p-10 rounded-3xl border-red-500/30 bg-red-500/5 text-center">
                <ShieldAlert size={60} className="text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-500">Fake Product Detected!</h2>
                <p className="text-slate-400 mt-2 mb-6">The serial number <span className="font-mono text-white bg-white/10 px-2 rounded">{scannedSerial}</span> does not exist in our blockchain records.</p>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleReport}
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
                  >
                    {isLoading ? <Loader2 className="animate-spin"/> : <><AlertTriangle size={20}/> Report to Manufacturer</>}
                  </button>
                  
                  <button onClick={() => { setScanned(false); setIsFake(false); setScannedSerial(""); }} className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl font-medium transition-all">
                    Scan Another
                  </button>
                </div>
              </div>
            ) : result ? (
              // --- Authentic Product UI ---
              <div className="glass-panel p-8 rounded-3xl border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-4 mb-6">
                   {result.imageHash ? (
                     <img 
                       src={`https://gateway.pinata.cloud/ipfs/${result.imageHash}`} 
                       alt="Product" 
                       className="w-24 h-24 rounded-xl object-cover border border-white/10 shadow-lg"
                     />
                   ) : (
                     <div className="w-24 h-24 bg-white/10 rounded-xl flex items-center justify-center"><Box /></div>
                   )}
                   <div>
                     <h2 className="text-2xl font-bold text-white">{result.name}</h2>
                     <p className="text-blue-400 text-sm">{result.manufacturer}</p>
                   </div>
                </div>

                <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 mb-6">
                  <div className="flex justify-between"><span className="text-slate-400">Status</span> <span className="text-green-400 font-bold flex items-center gap-1"><ShieldCheck size={16}/> Authentic</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Serial</span> <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded">{result.serial}</span></div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ownership</span> 
                    <span className={`text-xs px-2 py-1 rounded font-bold ${result.isSold ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                      {result.isSold ? "CLAIMED" : "AVAILABLE"}
                    </span>
                  </div>
                </div>

                {!result.isSold ? (
                  <button 
                    onClick={handleClaim}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-4 rounded-xl font-bold shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    <UserCheck size={20} /> Claim Ownership (Warranty)
                  </button>
                ) : (
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-slate-400 text-sm">Owned by:</p>
                    <p className="font-mono text-xs text-slate-300 mt-1 break-all">{result.currentOwner}</p>
                  </div>
                )}

                <button onClick={() => { setScanned(false); setIsFake(false); setResult(null); }} className="w-full mt-4 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-medium transition-all">Scan Another</button>
              </div>
            ) : (
              // --- Loading UI ---
              <div className="glass-panel p-10 rounded-3xl flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 text-lg">Verifying on Blockchain...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}