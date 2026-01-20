"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { useRouter } from "next/navigation";
import { uploadToIPFS } from "../../utils/ipfs";
import { QRCodeSVG } from "qrcode.react";
import { PackagePlus, QrCode, ArrowLeft, Image as ImageIcon, Loader2, Database, ScanBarcode, ShieldAlert } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { registerProduct, isLoading, account, totalProducts, totalScans, totalReports } = useWeb3();
  const router = useRouter();
  
  const [formData, setFormData] = useState({ serial: "", name: "", manufacturer: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (!account) {
      const timer = setTimeout(() => {
        toast.error("Please connect your wallet first!");
        router.push("/");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [account, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a product image!");

    const loadingId = toast.loading("Uploading image to IPFS...");
    const imageHash = await uploadToIPFS(file);

    if (imageHash) {
      toast.success("Image Uploaded!", { id: loadingId });
      const isSuccess = await registerProduct(formData.serial, formData.name, formData.manufacturer, imageHash);
      if (isSuccess) {
        setShowQR(true);
      }
    } else {
      toast.error("IPFS Upload Failed!", { id: loadingId });
    }
  };

  return (
    <>
      {/* ================= PRINT VIEW (Hidden on Screen, Visible on Print) ================= */}
      <div className="hidden print:flex flex-col items-center justify-center w-screen h-screen bg-white text-black fixed top-0 left-0 z-[9999]">
         <div className="flex flex-col items-center border-4 border-black p-10 rounded-[2rem] max-w-lg w-full">
            <h2 className="text-3xl font-bold mb-8 text-center uppercase tracking-wider">TrustChain Verified</h2>
            
            <div className="mb-6">
               {/* Print Size QR Code */}
               {formData.serial && <QRCodeSVG value={formData.serial} size={300} />}
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase font-bold mb-2">Serial Number</p>
              <p className="text-4xl font-mono font-bold tracking-widest text-black">{formData.serial}</p>
            </div>
         </div>
         <p className="mt-8 text-gray-400 text-sm">Scan to verify product authenticity</p>
      </div>
      {/* =================================================================================== */}


      {/* ================= NORMAL ADMIN UI (Hidden on Print) ================= */}
      <div className="min-h-screen bg-black text-white p-6 print:hidden">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white self-start md:self-center"><ArrowLeft size={20}/> Back</Link>
            
            <div className="flex flex-wrap gap-4">
              {/* Analytics Cards */}
              <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4 border-blue-500/30 bg-blue-500/5">
                <div className="p-2 bg-blue-500/20 rounded-lg"><Database className="text-blue-500" size={20} /></div>
                <div><p className="text-[10px] uppercase text-slate-500 font-bold">Total Products</p><p className="text-xl font-bold">{totalProducts}</p></div>
              </div>

              <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4 border-purple-500/30 bg-purple-500/5">
                <div className="p-2 bg-purple-500/20 rounded-lg"><ScanBarcode className="text-purple-500" size={20} /></div>
                <div><p className="text-[10px] uppercase text-slate-500 font-bold">Total Scans</p><p className="text-xl font-bold">{totalScans}</p></div>
              </div>

              <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-4 border-red-500/30 bg-red-500/5">
                <div className="p-2 bg-red-500/20 rounded-lg"><ShieldAlert className="text-red-500" size={20} /></div>
                <div><p className="text-[10px] uppercase text-slate-500 font-bold">Fake Reports</p><p className="text-xl font-bold">{totalReports}</p></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Registration Form */}
            <div className="glass-panel p-8 rounded-3xl border border-white/10">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><PackagePlus className="text-blue-500"/> New Registration</h2>
              <p className="text-sm text-slate-400 mb-4">Demo Mode: Anyone can register products.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Product Name" required className="bg-white/5 border border-white/10 p-3 rounded-xl outline-none" onChange={(e)=>setFormData({...formData, name: e.target.value})} />
                  <input type="text" placeholder="Serial ID" required className="bg-white/5 border border-white/10 p-3 rounded-xl outline-none font-mono text-sm" onChange={(e)=>setFormData({...formData, serial: e.target.value})} />
                </div>
                <input type="text" placeholder="Manufacturer" required className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none" onChange={(e)=>setFormData({...formData, manufacturer: e.target.value})} />
                
                <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-4 hover:border-blue-500/50 transition-all cursor-pointer">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-32 mx-auto rounded-lg object-cover" />
                  ) : (
                    <div className="text-center py-4">
                      <ImageIcon className="mx-auto text-slate-500 mb-2" />
                      <p className="text-xs text-slate-500">Upload Product Photo (IPFS)</p>
                    </div>
                  )}
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold transition-all disabled:opacity-50">
                  {isLoading ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin"/> Processing...</span> : "Register on TrustChain"}
                </button>
              </form>
            </div>

            {/* QR Display Area */}
            <div className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-center border-dashed border-white/10 min-h-[400px]">
              {showQR ? (
                <div className="text-center animate-in zoom-in duration-300">
                  <div className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-xl">
                    <QRCodeSVG value={formData.serial} size={180} />
                  </div>
                  <p className="font-mono text-blue-400 mb-4 tracking-wider">{formData.serial}</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={()=>window.print()} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2">
                      Download Label
                    </button>
                    <button onClick={()=>{setShowQR(false); setFormData({serial:"", name:"", manufacturer:""}); setFile(null); setPreview(null);}} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-4 py-2 rounded-lg text-sm transition-all">
                      New Product
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center opacity-20">
                  <QrCode size={64} className="mx-auto mb-2" />
                  <p>QR Identity Preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}