import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);


  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("Error: Insufficient funds. Please add Sepolia ETH to your wallet.");
    process.exit(1);
  }

 
  const ProductAuth = await ethers.getContractFactory("ProductAuth");
  

  console.log("⏳ Waiting for transaction to be mined...");
  const productAuth = await ProductAuth.deploy();


  await productAuth.waitForDeployment();

  const contractAddress = await productAuth.getAddress();
  
  console.log("----------------------------------------------------");
  console.log("ProductAuth Contract Deployed Successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("----------------------------------------------------");
  
 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});