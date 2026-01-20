"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Package, ShieldCheck, Box } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProfilePage() {
 
  const { account, getUserProducts, getProductDetails } = useWeb3();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [myProducts, setMyProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!account) {
      const timer = setTimeout(() => {
        toast.error("Please connect wallet!");
        router.push("/");
      }, 1000);
      return () => clearTimeout(timer);
    }

    const fetchMyCollection = async () => {
      setLoading(true);
      const serials = await getUserProducts();
      
      if (serials && serials.length > 0) {
        const productDetails = await Promise.all(
          serials.map(async (serial) => {
         
            const details = await getProductDetails(serial);
            if (!details) return null;
            
            return {
              serial,
              name: details.name,
              manufacturer: details.manufacturer,
              imageHash: details.imageHash,
              timestamp: Number(details.timestamp),
            };
          })
        );
      
        setMyProducts(productDetails.filter(p => p !== null).reverse());
      }
      setLoading(false);
    };

    fetchMyCollection();
  }, [account, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading your collection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white"><ArrowLeft size={20}/> Back to Home</Link>
          <div className="bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
            <span className="text-purple-400 text-sm font-bold">Wallet: {account?.slice(0, 6)}...{account?.slice(-4)}</span>
          </div>
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">My Digital Collection</h1>
          <p className="text-slate-400">Manage your authentic products and digital warranties.</p>
        </div>

        {myProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <Package size={64} className="mx-auto text-slate-600 mb-4" />
            <h2 className="text-xl font-bold text-slate-400">No Products Found</h2>
            <p className="text-slate-500 mt-2">You haven't claimed any products yet.</p>
            <Link href="/verify" className="mt-6 inline-block bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-all">Scan & Claim Now</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.map((item, index) => (
              <div key={index} className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all group bg-white/5">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-black/50">
                  {item.imageHash ? (
                    <img 
                      src={`https://gateway.pinata.cloud/ipfs/${item.imageHash}`} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Box className="text-slate-600"/></div>
                  )}
                  <div className="absolute top-2 right-2 bg-green-500/20 backdrop-blur-md border border-green-500/30 text-green-400 text-xs px-2 py-1 rounded-lg flex items-center gap-1 font-bold">
                    <ShieldCheck size={12} /> Owned
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                  <p className="text-blue-400 text-sm mb-4">{item.manufacturer}</p>
                  
                  <div className="bg-black/20 p-3 rounded-xl flex justify-between items-center border border-white/5">
                    <span className="text-slate-500 text-xs">Serial ID</span>
                    <span className="font-mono text-xs text-slate-300">{item.serial}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}