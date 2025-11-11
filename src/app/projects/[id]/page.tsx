// src/app/projects/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import WalletConnect from '@/components/WalletConnect';
import InvestModal from '@/components/InvestModal';
import MilestoneCard from '@/components/MilestoneCard';
import ImpactMetrics from '@/components/ImpactMetrics';
import { useProjectData } from '@/hooks/useProjectData';

export default function ProjectPage() {
  const params = useParams();
  const projectId = parseInt(params.id as string);
  const { project, loading, updateProjectInvestment, refreshProject } = useProjectData(projectId);
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);

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
  const handleInvestSuccess = (investmentAmount: string) => {
    if (updateProjectInvestment) {
      updateProjectInvestment(investmentAmount);
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((parseFloat(project.raisedAmount) / parseFloat(project.targetAmount)) * 100, 100);

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
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            </div>

            {/* Invest Button */}
            <button 
              onClick={() => setIsInvestModalOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={project.status !== 'Funding'}
            >
              {project.status === 'Funding' ? 'Invest in This Project' : 'Funding Complete'}
            </button>
          </div>
        </div>

        {/* Impact Metrics */}
        {project.impactMetrics && (
          <ImpactMetrics metrics={project.impactMetrics} />
        )}

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
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No milestones defined for this project yet.
              </div>
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
    </div>
  );
}