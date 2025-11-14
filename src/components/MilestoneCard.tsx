// src/components/MilestoneCard.tsx
'use client';

import { MouseEvent, useMemo, useState } from 'react';
import { updateMilestone, Milestone } from '@/data/projectState';

interface MilestoneCardProps {
  milestone: Milestone;
  projectId: number;
  onMilestoneUpdate?: () => void;
}

export default function MilestoneCard({ milestone, projectId, onMilestoneUpdate }: MilestoneCardProps) {
  const [submittingAction, setSubmittingAction] = useState<'complete' | 'verify' | 'reset' | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleVerify = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
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

  const handleComplete = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
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

  const handleReset = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
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
    <>
      <div
        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsModalOpen(true);
          }
        }}
      >
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
        {(formattedCompletedAt || formattedVerifiedAt) && (
          <div className="text-sm text-gray-500 space-y-1 mt-4">
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

        <div className="flex flex-wrap gap-3 mt-4">
          {!milestone.completed && (
            <button
              onClick={(event) => handleComplete(event)}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 transition-colors"
            >
              {submittingAction === 'complete' ? 'Marking...' : 'Mark Complete'}
            </button>
          )}

          {milestone.completed && !milestone.verified && (
            <button
              onClick={(event) => handleVerify(event)}
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
              onClick={(event) => handleReset(event)}
              disabled={isSubmitting}
              className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors disabled:text-red-300 disabled:border-red-100"
            >
              {submittingAction === 'reset' ? 'Resetting...' : 'Reset Milestone'}
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`milestone-${milestone.id}-title`}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-6 relative"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 id={`milestone-${milestone.id}-title`} className="text-2xl font-semibold text-gray-900">
                  {milestone.name}
                </h3>
                <p className="text-gray-600 mt-1">{milestone.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Funding</h4>
                <p className="text-lg font-semibold text-gray-900">${milestone.amount}K</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Status</h4>
                <p className="text-base font-medium text-gray-900">
                  {milestone.verified
                    ? 'Verified and Paid'
                    : milestone.completed
                      ? 'Completed • Awaiting Verification'
                      : 'Not Started'}
                </p>
                {formattedCompletedAt && (
                  <p className="text-sm text-gray-500 mt-2">Completed on {formattedCompletedAt}</p>
                )}
                {formattedVerifiedAt && (
                  <p className="text-sm text-gray-500">Verified on {formattedVerifiedAt}</p>
                )}
              </div>
            </div>

            {milestone.completed && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Proof of Work</h4>
                <div className="space-y-2">
                  {milestone.documents.length > 0 ? (
                    milestone.documents.map((document) => (
                      <div
                        key={document}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 shadow-sm"
                      >
                        <span className="font-medium">{document}</span>
                        <span className="text-gray-400">PDF</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No documents uploaded.</div>
                  )}
              </div>
            )}

            {milestone.verified && milestone.proofHash && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Verification Hash</h4>
                <code className="block bg-gray-900 text-green-200 rounded-lg px-4 py-3 text-xs break-all">
                  {milestone.proofHash}
                </code>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
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

              {(milestone.completed || milestone.verified) && (
                <button
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors disabled:text-red-300 disabled:border-red-100"
                >
                  {submittingAction === 'reset' ? 'Resetting...' : 'Reset Milestone'}
                </button>
              )}

              <button
                onClick={() => setIsModalOpen(false)}
                className="ml-auto text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
