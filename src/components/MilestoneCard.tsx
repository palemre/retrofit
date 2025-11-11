// src/components/MilestoneCard.tsx
'use client';

import { useMemo, useState } from 'react';
import { updateMilestone, Milestone } from '@/data/projectState';

interface MilestoneCardProps {
  milestone: Milestone;
  projectId: number;
  onMilestoneUpdate?: () => void;
}

export default function MilestoneCard({ milestone, projectId, onMilestoneUpdate }: MilestoneCardProps) {
  const [submittingAction, setSubmittingAction] = useState<'complete' | 'verify' | 'reset' | null>(null);
  const isSubmitting = submittingAction !== null;

  const formattedCompletedAt = useMemo(() => {
    if (!milestone.completedAt) return null;
    const date = new Date(milestone.completedAt);
    return date.toLocaleString();
  }, [milestone.completedAt]);

  const formattedVerifiedAt = useMemo(() => {
    if (!milestone.verifiedAt) return null;
    const date = new Date(milestone.verifiedAt);
    return date.toLocaleString();
  }, [milestone.verifiedAt]);

  const handleVerify = async () => {
    setSubmittingAction('verify');
    try {
      await updateMilestone(projectId, milestone.id, { verified: true });
      if (onMilestoneUpdate) onMilestoneUpdate();
    } catch (error) {
      console.error('Error verifying milestone:', error);
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleComplete = async () => {
    setSubmittingAction('complete');
    try {
      await updateMilestone(projectId, milestone.id, { completed: true });
      if (onMilestoneUpdate) onMilestoneUpdate();
    } catch (error) {
      console.error('Error completing milestone:', error);
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleReset = async () => {
    setSubmittingAction('reset');
    try {
      await updateMilestone(projectId, milestone.id, { completed: false, verified: false });
      if (onMilestoneUpdate) onMilestoneUpdate();
    } catch (error) {
      console.error('Error resetting milestone:', error);
    } finally {
      setSubmittingAction(null);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
              milestone.verified ? 'bg-green-500' : milestone.completed ? 'bg-blue-500' : 'bg-gray-400'
            }`}
          >
            {milestone.id}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{milestone.name}</h3>
            <p className="text-gray-600">{milestone.description}</p>
            <p className="text-sm text-gray-500 mt-1">Funding: ${milestone.amount}K</p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            milestone.verified ? 'bg-green-100 text-green-800' :
            milestone.completed ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}
        >
          {milestone.verified ? 'Verified' : milestone.completed ? 'Pending Verification' : 'Not Started'}
        </div>
      </div>

      {(formattedCompletedAt || formattedVerifiedAt) && (
        <div className="text-sm text-gray-500 space-y-1 mb-4">
          {formattedCompletedAt && (
            <div>
              Completed on <span className="font-medium text-gray-600">{formattedCompletedAt}</span>
            </div>
          )}
          {formattedVerifiedAt && (
            <div>
              Verified on <span className="font-medium text-gray-600">{formattedVerifiedAt}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!milestone.completed && (
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 transition-colors"
          >
            {submittingAction === 'complete' ? 'Marking...' : 'Mark Complete'}
          </button>
        )}

        {milestone.completed && !milestone.verified && (
          <button
            onClick={handleVerify}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 transition-colors"
          >
            {submittingAction === 'verify' ? 'Verifying...' : 'Verify Work'}
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
            disabled={isSubmitting}
            className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors disabled:text-red-300 disabled:border-red-100"
          >
            {submittingAction === 'reset' ? 'Resetting...' : 'Reset Milestone'}
          </button>
        )}
      </div>
    </div>
  );
}
