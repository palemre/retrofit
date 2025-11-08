// src/hooks/useRetroFitContract.ts
'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { ethers } from 'ethers'; // ← ADD THIS IMPORT

// Contract ABI - this is the interface to interact with your smart contract
const RETROFIT_ABI = [
  "function projectCounter() public view returns (uint256)",
  "function projects(uint256) public view returns (uint256 id, address owner, string name, string description, uint256 targetAmount, uint256 raisedAmount, uint256 expectedReturn, uint256 duration, uint8 status, uint256 investorCount)",
  "function invest(uint256 _projectId) external payable",
  "function getProject(uint256 _projectId) external view returns (tuple(uint256 id, address owner, string name, string description, uint256 targetAmount, uint256 raisedAmount, uint256 expectedReturn, uint256 duration, uint8 status, uint256 investorCount))",
  "event InvestmentMade(uint256 indexed projectId, address indexed investor, uint256 amount)"
];

// Your deployed contract address - replace with the one you got from deployment
const CONTRACT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

export function useRetroFitContract() {
  const { account, isConnected } = useWeb3();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeContract = async () => {
      if (isConnected && typeof window.ethereum !== 'undefined') {
        try {
          // Initialize contract connection
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const retrofitContract = new ethers.Contract(CONTRACT_ADDRESS, RETROFIT_ABI, signer);
          setContract(retrofitContract);
        } catch (error) {
          console.error('Error initializing contract:', error);
        }
      }
    };

    initializeContract();
  }, [isConnected, account]);

  const investInProject = async (projectId: number, amount: string) => {
    if (!contract || !account) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      // Convert amount to wei (ETH uses 18 decimal places)
      const amountInWei = ethers.parseEther(amount);
      
      // Send transaction
      const tx = await contract.invest(projectId, { value: amountInWei });
      
      // Wait for transaction confirmation
      await tx.wait();
      
      return tx;
    } catch (error) {
      console.error('Investment error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProjectDetails = async (projectId: number) => {
    if (!contract) return null;

    try {
      const project = await contract.getProject(projectId);
      return {
        id: project[0].toString(),
        owner: project[1],
        name: project[2],
        description: project[3],
        targetAmount: project[4].toString(),
        raisedAmount: project[5].toString(),
        expectedReturn: project[6].toString(),
        duration: project[7].toString(),
        status: parseInt(project[8]),
        investorCount: project[9].toString()
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  };

  return {
    contract,
    investInProject,
    getProjectDetails,
    loading
  };
}