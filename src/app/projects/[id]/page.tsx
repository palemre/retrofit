// src/app/projects/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import InvestModal from '@/components/InvestModal';
import MilestoneCard from '@/components/MilestoneCard';
import ImpactMetrics from '@/components/ImpactMetrics';
import { useProjectData } from '@/hooks/useProjectData';
import ProjectTimeline from '@/components/ProjectTimeline';
import AIAgentPanel from '@/components/AIAgentPanel';
import DataRoomModal from '@/components/DataRoomModal';

export default function ProjectPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const { project, loading, updateProjectInvestment, refreshProject, resetFunding } = useProjectData(projectId);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [isDataRoomOpen, setIsDataRoomOpen] = useState(false);
  const [isResettingFunding, setIsResettingFunding] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState<number | null>(null);

  const formatDateTime = useMemo(
    () =>
      (isoString: string) => {
        if (!isoString) return '—';
        const date = new Date(isoString);
        if (Number.isNaN(date.getTime())) {
          return '—';
        }
        return date.toLocaleString();
      },
    []
  );

  // Loading state - shows spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  // Error state - if project doesn't exist
  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <button 
            onClick={() => window.history.back()}
            className="text-green-600 hover:text-green-800"
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  // Handle successful investment - update the project data
  const handleInvestSuccess = (investmentAmount: string, investorWallet: string) => {
    if (updateProjectInvestment) {
      updateProjectInvestment(investmentAmount, investorWallet);
    }
  };

  const formatWallet = (wallet: string) => {
    if (!wallet) return '—';
    return wallet.length > 10 ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : wallet;
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((parseFloat(project.raisedAmount) / parseFloat(project.targetAmount)) * 100, 100);
  const releasedFunds = parseFloat(project.projectWalletBalance || '0');
  const formattedReleasedFunds = Number.isNaN(releasedFunds)
    ? '0.00'
    : releasedFunds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleResetFunding = () => {
    const confirmReset = window.confirm('Reset fundraising totals for this project?');
    if (!confirmReset) return;
    setIsResettingFunding(true);
    try {
      resetFunding();
      refreshProject();
    } finally {
      setIsResettingFunding(false);
    }
  };

  // Main page content - only shows when data is loaded
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={() => window.history.back()}
            className="text-green-600 hover:text-green-800 font-medium flex items-center gap-2"
          >
            ← Back to Projects
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">RetroFit</span>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Project Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-40">
        {/* Back button */}
        <button 
          onClick={() => window.history.back()}
          className="mb-6 text-green-600 hover:text-green-800 font-medium flex items-center gap-2"
        >
          ← Back to Projects
        </button>

        {/* Project Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <img 
            src={project.image} 
            alt={project.name}
            className="w-full h-64 object-cover"
          />
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                {project.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-lg mb-2">📍 {project.address}</p>
            <p className="text-gray-700 mb-6 leading-relaxed">{project.description}</p>

            {/* Investment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{project.expectedReturn}</div>
                <div className="text-gray-600">Expected Return</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{project.duration}</div>
                <div className="text-gray-600">Investment Period</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  ${parseFloat(project.raisedAmount).toLocaleString()}
                </div>
                <div className="text-gray-600">Raised of ${parseFloat(project.targetAmount).toLocaleString()}</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{project.investorCount}</div>
                <div className="text-gray-600">Investors</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Funding Progress</span>
                <span>{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Raised: ${parseFloat(project.raisedAmount).toLocaleString()}</span>
                <span>Target: ${parseFloat(project.targetAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleResetFunding}
                  className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-3 py-1 rounded-lg transition-colors"
                  disabled={isResettingFunding}
                >
                  {isResettingFunding ? 'Resetting...' : 'Reset Fundraising'}
                </button>
              </div>
            </div>

            {/* Data Room & Invest Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setIsDataRoomOpen(true)}
                className="w-full rounded-lg border border-green-600 bg-white px-6 py-4 text-lg font-semibold text-green-700 transition-colors hover:bg-green-50"
              >
                Open Project Data Room
              </button>

              <button
                onClick={() => setIsInvestModalOpen(true)}
                className="w-full rounded-lg bg-green-600 px-6 py-4 text-lg font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                disabled={project.status !== 'Funding'}
              >
                {project.status === 'Funding' ? 'Invest in This Project' : 'Funding Complete'}
              </button>
            </div>
          </div>
        </div>

        <AIAgentPanel project={project} />

        {/* On-Chain Asset Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">On-Chain Asset Overview</h2>
          <p className="text-gray-600 mb-6">
            This retrofit initiative is issued as its own ERC-1155 asset. The project token is
            administered by the dedicated treasury wallet below, and milestone payouts are streamed
            into that wallet once work is verified.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Token Standard</div>
              <div className="text-lg font-semibold text-gray-900">ERC-1155</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Token ID</div>
              <div className="text-lg font-semibold text-gray-900">{project.erc1155TokenId}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Contract Address</div>
              <code className="block text-sm md:text-base text-green-700 bg-green-50 px-3 py-2 rounded-lg break-words">
                {project.erc1155ContractAddress}
              </code>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Project Treasury Wallet</div>
              <code className="block text-sm md:text-base text-blue-700 bg-blue-50 px-3 py-2 rounded-lg break-words">
                {project.projectWalletAddress}
              </code>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-gray-500 mb-1">Released Funds Currently Held</div>
              <div className="text-lg font-semibold text-gray-900">
                ${formattedReleasedFunds}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Funds remain at zero until milestones are marked complete and verified, at which point the
                corresponding tranche is deposited to the treasury wallet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                The ERC-1155 token is held by the treasury wallet, representing on-chain ownership of this
                retrofit project.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Investment History</h3>
            {project.investmentHistory && project.investmentHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investor Wallet</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (ETH)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {project.investmentHistory
                      .slice()
                      .reverse()
                      .map((transaction) => {
                        const amountValue = Number.parseFloat(transaction.amount);
                        const formattedAmount = Number.isNaN(amountValue)
                          ? transaction.amount
                          : amountValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            });

                        return (
                          <tr key={transaction.id}>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(transaction.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700 font-mono">{formatWallet(transaction.investorWallet)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{formattedAmount}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No investments recorded yet. Be the first to invest!</div>
            )}
          </div>
        </div>

        {/* Impact Metrics */}
        {project.impactMetrics && (
          <ImpactMetrics metrics={project.impactMetrics} />
        )}

        {/* Project Timeline */}
        <ProjectTimeline
          milestones={project.milestones}
          scorecard={project.impactMetrics?.leedScorecard}
          payoutHistory={project.milestonePayoutHistory}
          onSelectMilestone={(milestoneId) => setActiveMilestoneId(milestoneId)}
        />

        {/* Milestones Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Milestones</h2>
          <div className="space-y-4">
            {project.milestones && project.milestones.length > 0 ? (
              project.milestones.map((milestone: any) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  projectId={project.id}
                  onMilestoneUpdate={refreshProject}
                  isModalOpen={activeMilestoneId === milestone.id}
                  onModalToggle={(isOpen) => setActiveMilestoneId(isOpen ? milestone.id : null)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No milestones defined for this project yet.
              </div>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Milestone Release History</h3>
            {project.milestonePayoutHistory && project.milestonePayoutHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Released Amount (USD&nbsp;K)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {project.milestonePayoutHistory
                      .slice()
                      .reverse()
                      .map((release) => {
                        const releaseValue = Number.parseFloat(release.amount || '0');
                        const formattedRelease = Number.isNaN(releaseValue)
                          ? release.amount
                          : releaseValue.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });

                        return (
                          <tr key={release.id}>
                            <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(release.date)}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{release.milestoneName}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                              ${formattedRelease}
                              {Number.isNaN(releaseValue) ? '' : 'K'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Milestone releases will appear here once payouts are made.</div>
            )}
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      <InvestModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        project={project}
        onInvestSuccess={handleInvestSuccess}
      />

      <DataRoomModal
        isOpen={isDataRoomOpen}
        onClose={() => setIsDataRoomOpen(false)}
        projectName={project.name}
      />
    </div>
  );
}
