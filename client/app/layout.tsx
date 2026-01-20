import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../context/Web3Context";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrustChain | Anti-Counterfeit",
  description: "Blockchain based product authentication",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Web3Provider>
          {children}
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: "#1e293b",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)"
              },
            }} 
          />
        </Web3Provider>
      </body>
    </html>
  );
}