// src/components/ImpactMetrics.tsx
'use client';

import { ImpactMetrics as ImpactMetricsType } from '@/data/projectTypes';

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
  if (!metrics) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Environmental Impact</h2>
          <p className="text-gray-600 mt-1">
            Track the tangible climate and community benefits delivered by this retrofit project.
          </p>
        </div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
          {metrics.leedCertification}
        </div>
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
    </div>
  );
}
