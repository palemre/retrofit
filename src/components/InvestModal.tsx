// src/components/InvestModal.tsx
'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { Project } from '@/data/projectState';

interface InvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onInvestSuccess?: (investmentAmount: string, investorWallet: string) => void;
}

export default function InvestModal({ isOpen, onClose, project, onInvestSuccess }: InvestModalProps) {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInvest = async () => {
    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      alert('Please enter a valid investment amount');
      return;
    }

    setLoading(true);
    try {
      // Get current account from MetaMask
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const currentAccount = accounts[0];

      // Generate the function call data for invest(projectId)
      const projectIdHex = ethers.utils.hexZeroPad(
        ethers.BigNumber.from(project.id).toHexString(), 
        32
      );
      const data = '0x2afcf480' + projectIdHex.slice(2); // invest(projectId)

      const transactionParameters = {
        to: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9', // Your contract address
        from: currentAccount,
        value: ethers.utils.parseEther(investmentAmount).toHexString(),
        gas: '0x7A120', // 500,000 gas for contract call
        data: data
      };
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      });
      
      alert(`✅ Successfully invested ${investmentAmount} ETH in ${project.name}! Transaction: ${txHash}`);
      
      // Call the success callback if it exists
      if (onInvestSuccess) {
        onInvestSuccess(investmentAmount, currentAccount);
      }
      
      onClose();
      setInvestmentAmount('');
      
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Investment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const percentageOwnership = project.targetAmount > 0 
    ? ((parseFloat(investmentAmount || '0') / parseFloat(project.targetAmount)) * 100).toFixed(2)
    : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Invest in {project.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Amount (ETH)
            </label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {investmentAmount && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Your Investment</div>
                  <div className="font-semibold">{investmentAmount} ETH</div>
                </div>
                <div>
                  <div className="text-gray-600">Project Share</div>
                  <div className="font-semibold">{percentageOwnership}%</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInvest}
              disabled={loading || !investmentAmount}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Confirm Investment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}