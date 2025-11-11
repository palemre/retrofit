// src/components/MilestoneCard.tsx
'use client';

import { useState } from 'react';
import { updateMilestone, resetMilestone as resetMilestoneState, Milestone } from '@/data/projectState';

const formatTimestamp = (value?: string | null) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface MilestoneCardProps {
  milestone: Milestone;
  projectId: number;
  onMilestoneUpdate?: () => void;
}

export default function MilestoneCard({ milestone, projectId, onMilestoneUpdate }: MilestoneCardProps) {
  const [pendingAction, setPendingAction] = useState<'complete' | 'verify' | 'reset' | null>(null);

  const handleVerify = async () => {
    setPendingAction('verify');
    try {
      // Update milestone to verified
      await updateMilestone(projectId, milestone.id, { verified: true });
      if (onMilestoneUpdate) onMilestoneUpdate();
    } catch (error) {
      console.error('Error verifying milestone:', error);
    } finally {
      setPendingAction(null);
    }
  };

  const handleComplete = async () => {
    setPendingAction('complete');
    try {
      // Update milestone to completed
      await updateMilestone(projectId, milestone.id, { completed: true });
      if (onMilestoneUpdate) onMilestoneUpdate();
    } catch (error) {
      console.error('Error completing milestone:', error);
    } finally {
      setPendingAction(null);
    }
  };

  const handleReset = async () => {
    setPendingAction('reset');
    try {
      await resetMilestoneState(projectId, milestone.id);
      if (onMilestoneUpdate) onMilestoneUpdate();
    } catch (error) {
      console.error('Error resetting milestone:', error);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
            milestone.verified ? 'bg-green-500' : 
            milestone.completed ? 'bg-blue-500' : 'bg-gray-400'
          }`}>
            {milestone.id}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{milestone.name}</h3>
            <p className="text-gray-600">{milestone.description}</p>
            <p className="text-sm text-gray-500 mt-1">Funding: ${milestone.amount}K</p>
            {milestone.completedAt && (
              <p className="text-xs text-blue-600 mt-2">
                Completed on {formatTimestamp(milestone.completedAt)}
              </p>
            )}
            {milestone.verifiedAt && (
              <p className="text-xs text-green-600 mt-1">
                Verified on {formatTimestamp(milestone.verifiedAt)}
              </p>
            )}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          milestone.verified ? 'bg-green-100 text-green-800' :
          milestone.completed ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {milestone.verified ? 'Verified' :
           milestone.completed ? 'Pending Verification' : 'Not Started'}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!milestone.completed && (
          <button
            onClick={handleComplete}
            disabled={pendingAction !== null}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 transition-colors"
          >
            {pendingAction === 'complete' ? 'Marking...' : 'Mark Complete'}
          </button>
        )}

        {milestone.completed && !milestone.verified && (
          <button
            onClick={handleVerify}
            disabled={pendingAction !== null}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 transition-colors"
          >
            {pendingAction === 'verify' ? 'Verifying...' : 'Verify Work'}
          </button>
        )}

        {milestone.verified && (
          <span className="text-green-600 font-medium flex items-center gap-2">
            <span>✅</span>
            Verified and Paid
          </span>
        )}

        {(milestone.completed || milestone.verified) && (
          <button
            onClick={handleReset}
            disabled={pendingAction !== null}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-200 disabled:text-gray-500"
          >
            {pendingAction === 'reset' ? 'Resetting...' : 'Reset Milestone'}
          </button>
        )}
      </div>
    </div>
  );
}