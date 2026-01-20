"use client";

import React, { createContext, useContext, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import ProductAuthABI from "../utils/ProductAuth.json";
import toast from "react-hot-toast";

const CONTRACT_ADDRESS = "0x725D5f2EF3A09E0Aac061460478Bd0aC7937648A";

interface Web3ContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  registerProduct: (serial: string, name: string, manufacturer: string, imageHash: string) => Promise<boolean>;
  verifyProduct: (serial: string) => Promise<any>;
  claimProduct: (serial: string) => Promise<boolean>;
  reportFake: (serial: string) => Promise<boolean>;
  getUserProducts: () => Promise<string[]>;
  getProductDetails: (serial: string) => Promise<any>;
  isLoading: boolean;
  totalProducts: number;
  totalScans: number;
  totalReports: number;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [totalReports, setTotalReports] = useState(0);

  const fetchStats = async (contractInstance: Contract) => {
    try {
      const pCount = await contractInstance.totalProducts();
      const sCount = await contractInstance.totalScans();
      const rCount = await contractInstance.totalReports();
      setTotalProducts(Number(pCount));
      setTotalScans(Number(sCount));
      setTotalReports(Number(rCount));
    } catch (err) {
      console.error(err);
    }
  };

  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) {
        toast.error("Please install MetaMask");
        return;
      }
      
      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);

      const newContract = new Contract(CONTRACT_ADDRESS, ProductAuthABI.abi, signer);
      setContract(newContract);
      
      await fetchStats(newContract); 
      toast.success("Wallet Connected");
    } catch (error) {
      console.error(error);
      toast.error("Connection Failed");
    }
  };

  const registerProduct = async (serial: string, name: string, manufacturer: string, imageHash: string): Promise<boolean> => {
    if (!contract) { 
      toast.error("Connect Wallet First"); 
      return false; 
    }
    const toastId = "reg-toast";
    setIsLoading(true);
    toast.loading("Processing...", { id: toastId });
    try {
      const tx = await contract.registerProduct(serial, name, manufacturer, imageHash);
      await tx.wait();
      
      await fetchStats(contract);
      toast.success("Registration Successful", { id: toastId });
      return true;
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast.error("Registration Failed", { id: toastId });
      return false;
    } finally { 
      setIsLoading(false); 
    }
  };

  const claimProduct = async (serial: string): Promise<boolean> => {
    if (!contract) { 
      toast.error("Connect Wallet First"); 
      return false; 
    }
    const toastId = "claim-toast";
    setIsLoading(true);
    toast.loading("Transferring Ownership...", { id: toastId });
    try {
      const tx = await contract.claimOwnership(serial);
      await tx.wait();
      toast.success("Ownership Claimed", { id: toastId });
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error("Claim Failed", { id: toastId });
      return false;
    } finally { 
      setIsLoading(false); 
    }
  };

  const reportFake = async (serial: string): Promise<boolean> => {
    if (!contract) { 
      toast.error("Connect Wallet First"); 
      return false; 
    }
    const toastId = "report-toast";
    setIsLoading(true);
    toast.loading("Reporting...", { id: toastId });
    try {
      const tx = await contract.reportFake(serial, "Mobile Scan");
      await tx.wait();
      await fetchStats(contract); 
      toast.success("Report Sent", { id: toastId });
      return true;
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to Report", { id: toastId });
      return false;
    } finally { 
      setIsLoading(false); 
    }
  };

  const getUserProducts = async (): Promise<string[]> => {
    if (!contract || !account) return [];
    try {
      const products = await contract.getUserProducts(account);
      return Array.from(products);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const verifyProduct = async (serial: string) => {
    if (!contract) return null;
    try {
      const product = await contract.verifyProduct.staticCall(serial);
      
      try {
        const tx = await contract.verifyProduct(serial);
        tx.wait().then(() => {
            fetchStats(contract);
        });
      } catch (txError) {
        console.warn("Scan count update skipped");
      }

      return product;
    } catch (error) { 
      console.error(error);
      return null; 
    }
  };

  const getProductDetails = async (serial: string) => {
    if (!contract) return null;
    try {
      const product = await contract.verifyProduct.staticCall(serial);
      return product;
    } catch (error) { 
      return null; 
    }
  };

  return (
    <Web3Context.Provider value={{ account, connectWallet, registerProduct, verifyProduct, claimProduct, reportFake, getUserProducts, getProductDetails, isLoading, totalProducts, totalScans, totalReports }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 Error");
  return context;
};