// src/components/ImpactMetrics.tsx
'use client';

import { useState } from 'react';
import { ImpactMetrics as ImpactMetricsType } from '@/data/projectState';

interface ImpactMetricsProps {
  metrics: ImpactMetricsType;
}

const metricConfig: {
  key: keyof ImpactMetricsType;
  label: string;
  description: string;
  icon: string;
  formatter?: (value: number | string) => string;
}[] = [
  {
    key: 'annualCO2Reduction',
    label: 'Annual CO₂ Reduction',
    description: 'Projected carbon avoided each year',
    icon: '🌍',
    formatter: (value) => `${Number(value).toLocaleString()} tons`,
  },
  {
    key: 'energySavings',
    label: 'Energy Efficiency Gain',
    description: 'Improvement in energy performance',
    icon: '⚡',
    formatter: (value) => `${Number(value).toFixed(0)}%`,
  },
  {
    key: 'jobsCreated',
    label: 'Green Jobs Supported',
    description: 'Local jobs sustained through the retrofit',
    icon: '👷',
    formatter: (value) => `${Number(value).toLocaleString()} jobs`,
  },
];

export default function ImpactMetrics({ metrics }: ImpactMetricsProps) {
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);

  if (!metrics) return null;

  const hasLeedScorecard = Boolean(metrics.leedScorecard && metrics.leedScorecard.categories?.length);
  const scorecard = metrics.leedScorecard;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Environmental Impact</h2>
          <p className="text-gray-600 mt-1">
            Track the tangible climate and community benefits delivered by this retrofit project.
          </p>
        </div>
        <button
          type="button"
          onClick={() => hasLeedScorecard && setIsScorecardOpen(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
            hasLeedScorecard
              ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500'
              : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
          }`}
          aria-disabled={!hasLeedScorecard}
        >
          <span className="font-semibold">
            {hasLeedScorecard && typeof scorecard?.totalPoints === 'number'
              ? `${metrics.leedCertification} • ${scorecard.totalPoints} pts`
              : metrics.leedCertification}
          </span>
          {hasLeedScorecard && <span className="ml-2 text-xs text-green-700 underline">View scorecard</span>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricConfig.map(({ key, label, description, icon, formatter }) => {
          const value = metrics[key];
          if (value === undefined || value === null) {
            return null;
          }

          const displayValue = formatter
            ? formatter(value as number)
            : typeof value === 'number'
            ? value.toLocaleString()
            : value;

          return (
            <div key={key as string} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl" aria-hidden>{icon}</span>
                <div>
                  <div className="text-sm uppercase tracking-wide text-gray-500">{label}</div>
                  <div className="text-2xl font-semibold text-gray-900">{displayValue}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
            </div>
          );
        })}
      </div>

      {isScorecardOpen && hasLeedScorecard && scorecard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-4xl w-full bg-white rounded-2xl shadow-2xl">
            <button
              type="button"
              onClick={() => setIsScorecardOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close LEED scorecard"
            >
              ✕
            </button>
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">LEED Certification Scorecard</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {scorecard.certificationLevel}
                    {typeof scorecard.totalPoints === 'number' ? ` • ${scorecard.totalPoints} pts` : ''}
                    {scorecard.scorecardStatus ? ` • ${scorecard.scorecardStatus}` : ''}
                  </p>
                  {scorecard.reviewingOrganization && (
                    <p className="text-sm text-gray-600">
                      {scorecard.reviewingOrganization}
                      {scorecard.certificationDate
                        ? ` • Awarded ${new Date(scorecard.certificationDate).toLocaleDateString()}`
                        : ''}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm uppercase tracking-wide text-gray-500">Total Points</div>
                  <div className="text-3xl font-semibold text-green-700">{scorecard.totalPoints}</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Points Achieved
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Points Available
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scorecard.categories.map((category) => (
                      <tr key={category.category}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{category.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                          {category.achievedPoints}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{category.availablePoints}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                          {category.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Milestone Contribution History</h4>
                {scorecard.history && scorecard.history.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Milestone
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Points Awarded
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Awarded On
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scorecard.history.map((entry) => {
                          const awardedDate = entry.awardedAt ? new Date(entry.awardedAt) : null;
                          const formattedAwarded = awardedDate ? awardedDate.toLocaleString() : '—';

                          return (
                            <tr key={`${entry.milestoneId}-${entry.category}-${entry.awardedAt}`}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{entry.milestoneName}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{entry.category}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                                +{entry.pointsAwarded}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formattedAwarded}</td>
                              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                                {entry.note || '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    Verified milestone contributions will appear here once they are awarded.
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsScorecardOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-green-700 hover:text-green-900"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
