// src/components/MilestoneCard.tsx
'use client';

import { MouseEvent, useMemo, useState } from 'react';
import { Milestone, updateMilestone } from '@/data/projectState';

interface MilestoneCardProps {
  milestone: Milestone;
  projectId: number;
  onMilestoneUpdate?: () => void;
}

type MilestoneAction = 'complete' | 'verify' | 'reset';

const statusStyles: Record<'default' | 'completed' | 'verified', string> = {
  default: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  verified: 'bg-green-100 text-green-800',
};

const statusLabel = (milestone: Milestone): string => {
  if (milestone.verified) {
    return 'Verified';
  }
  if (milestone.completed) {
    return 'Pending Verification';
  }
  return 'Not Started';
};

export default function MilestoneCard({ milestone, projectId, onMilestoneUpdate }: MilestoneCardProps) {
  const [pendingAction, setPendingAction] = useState<MilestoneAction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedCompletedAt = useMemo(() => {
    if (!milestone.completedAt) return null;
    const date = new Date(milestone.completedAt);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
  }, [milestone.completedAt]);

  const formattedVerifiedAt = useMemo(() => {
    if (!milestone.verifiedAt) return null;
    const date = new Date(milestone.verifiedAt);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
  }, [milestone.verifiedAt]);

  const isSubmitting = pendingAction !== null;
  const cardStatusStyle = milestone.verified
    ? statusStyles.verified
    : milestone.completed
      ? statusStyles.completed
      : statusStyles.default;

  const handleAction = async (
    action: MilestoneAction,
    updates: Partial<Milestone>,
    event?: MouseEvent<HTMLButtonElement>,
  ) => {
    event?.stopPropagation();
    setPendingAction(action);
    try {
      await updateMilestone(projectId, milestone.id, updates);
      onMilestoneUpdate?.();
    } catch (error) {
      console.error(`Error performing milestone ${action}:`, error);
    } finally {
      setPendingAction(null);
    }
  };

  const closeModal = () => setIsModalOpen(false);
  const openModal = () => setIsModalOpen(true);

  const milestoneDocuments = Array.isArray(milestone.documents) ? milestone.documents : [];
  const hasDocuments = milestoneDocuments.length > 0;

  return (
    <>
      <div
        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
        role="button"
        tabIndex={0}
        onClick={openModal}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openModal();
          }
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
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
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${cardStatusStyle}`}>
            {statusLabel(milestone)}
          </span>
        </div>

        {(formattedCompletedAt || formattedVerifiedAt) && (
          <div className="text-sm text-gray-500 space-y-1 mt-4">
            {formattedCompletedAt && (
              <p>
                Completed on{' '}
                <span className="font-medium text-gray-600">{formattedCompletedAt}</span>
              </p>
            )}
            {formattedVerifiedAt && (
              <p>
                Verified on{' '}
                <span className="font-medium text-gray-600">{formattedVerifiedAt}</span>
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          {!milestone.completed && (
            <button
              type="button"
              onClick={(event) => handleAction('complete', { completed: true }, event)}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {pendingAction === 'complete' ? 'Marking...' : 'Mark Complete'}
            </button>
          )}

          {milestone.completed && !milestone.verified && (
            <button
              type="button"
              onClick={(event) => handleAction('verify', { verified: true }, event)}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {pendingAction === 'verify' ? 'Verifying...' : 'Verify Work'}
            </button>
          )}

          {milestone.verified && (
            <span className="text-green-600 font-medium flex items-center gap-2 text-sm">
              <span aria-hidden="true">✅</span>
              Verified and Paid
            </span>
          )}

          {(milestone.completed || milestone.verified) && (
            <button
              type="button"
              onClick={(event) => handleAction('reset', { completed: false, verified: false }, event)}
              disabled={isSubmitting}
              className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors disabled:text-red-300 disabled:border-red-100 disabled:cursor-not-allowed"
            >
              {pendingAction === 'reset' ? 'Resetting...' : 'Reset Milestone'}
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
          onClick={closeModal}
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
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                aria-label="Close milestone details"
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
                <p className="text-base font-medium text-gray-900">{statusLabel(milestone)}</p>
                {formattedCompletedAt && (
                  <p className="text-sm text-gray-500 mt-2">Completed on {formattedCompletedAt}</p>
                )}
                {formattedVerifiedAt && (
                  <p className="text-sm text-gray-500">Verified on {formattedVerifiedAt}</p>
                )}
              </div>
            </div>

            {(milestone.completed || hasDocuments) && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Proof of Work</h4>
                <div className="space-y-2">
                  {hasDocuments ? (
                    milestoneDocuments.map((document) => (
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
                  type="button"
                  onClick={(event) => handleAction('complete', { completed: true }, event)}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {pendingAction === 'complete' ? 'Marking...' : 'Mark Complete'}
                </button>
              )}

              {milestone.completed && !milestone.verified && (
                <button
                  type="button"
                  onClick={(event) => handleAction('verify', { verified: true }, event)}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {pendingAction === 'verify' ? 'Verifying...' : 'Verify Work'}
                </button>
              )}

              {(milestone.completed || milestone.verified) && (
                <button
                  type="button"
                  onClick={(event) => handleAction('reset', { completed: false, verified: false }, event)}
                  disabled={isSubmitting}
                  className="text-sm text-red-600 hover:text-red-700 font-medium border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg transition-colors disabled:text-red-300 disabled:border-red-100 disabled:cursor-not-allowed"
                >
                  {pendingAction === 'reset' ? 'Resetting...' : 'Reset Milestone'}
                </button>
              )}

              <button
                type="button"
                onClick={closeModal}
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
