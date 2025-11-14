// src/components/ProjectTimeline.tsx
'use client';

import { useMemo, useState } from 'react';
import type {
  LeedScorecard,
  Milestone,
  MilestonePayoutTransaction,
} from '@/data/projectState';

interface ProjectTimelineProps {
  milestones?: Milestone[];
  scorecard?: LeedScorecard;
  onSelectMilestone?: (milestoneId: number) => void;
  payoutHistory?: MilestonePayoutTransaction[];
}

type TimelineEventType = 'completed' | 'verified';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  milestoneId: number;
  milestoneName: string;
  isoDate: string;
  date: Date;
  cumulativePoints: number;
  pointsDelta: number;
  cumulativeFunds: number;
  fundsDelta: number;
  x: number;
  y: number;
  tooltipDate: string;
}

const chartWidth = 1000;
const chartHeight = 280;
const padding = {
  top: 24,
  right: 40,
  bottom: 64,
  left: 72,
};

const clampNumber = (value: number) => (Number.isFinite(value) ? value : 0);

const getPointsDeltaFromHistory = (entryPoints: number, awards?: { points?: number }[]) => {
  if (Number.isFinite(entryPoints) && entryPoints > 0) {
    return entryPoints;
  }

  if (!awards || awards.length === 0) {
    return 0;
  }

  return awards.reduce((sum, award) => {
    const safePoints = clampNumber(award.points ?? 0);
    return sum + (safePoints > 0 ? safePoints : 0);
  }, 0);
};

const parseAmount = (amount?: string | null) => {
  if (!amount) return 0;
  const parsed = parseFloat(amount);
  return Number.isFinite(parsed) ? parsed : 0;
};

interface NormalizedPayout extends MilestonePayoutTransaction {
  parsedAmount: number;
  parsedDate: Date | null;
  used?: boolean;
}

export default function ProjectTimeline({
  milestones = [],
  scorecard,
  onSelectMilestone,
  payoutHistory = [],
}: ProjectTimelineProps) {
  const [metric, setMetric] = useState<'funds' | 'points'>('funds');
  const [valueMode, setValueMode] = useState<'cumulative' | 'individual'>('cumulative');
  const [eventFilter, setEventFilter] = useState<'all' | 'verified'>('all');

  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];
    const verifiedEvents: TimelineEvent[] = [];

    const payoutMap = new Map<number, NormalizedPayout[]>();
    payoutHistory.forEach((entry) => {
      const parsedDate = entry.date ? new Date(entry.date) : null;
      if (parsedDate && Number.isNaN(parsedDate.getTime())) {
        payoutMap.set(entry.milestoneId, [
          ...(payoutMap.get(entry.milestoneId) || []),
          { ...entry, parsedDate: null, parsedAmount: parseAmount(entry.amount) },
        ]);
        return;
      }

      payoutMap.set(entry.milestoneId, [
        ...(payoutMap.get(entry.milestoneId) || []),
        { ...entry, parsedDate, parsedAmount: parseAmount(entry.amount) },
      ]);
    });

    const milestoneAmounts = new Map<number, number>();
    milestones.forEach((milestone) => {
      milestoneAmounts.set(milestone.id, parseAmount(milestone.amount));
    });

    const historyEntries = (scorecard?.milestoneHistory || [])
      .map((entry) => {
        const isoDate = entry.verifiedAt;
        if (!isoDate) return null;
        const date = new Date(isoDate);
        if (Number.isNaN(date.getTime())) {
          return null;
        }

        const delta = getPointsDeltaFromHistory(entry.totalPointsAwarded ?? 0, entry.awards);
        return {
          id: entry.id,
          milestoneId: entry.milestoneId,
          milestoneName: entry.milestoneName,
          isoDate,
          date,
          pointsDelta: delta,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const findPayoutForEvent = (milestoneId: number, isoDate: string, date: Date) => {
      const entries = payoutMap.get(milestoneId);
      if (!entries || entries.length === 0) {
        return null;
      }

      let candidate = entries.find((entry) => !entry.used && entry.date === isoDate);
      if (!candidate && date) {
        candidate = entries.find((entry) => {
          if (entry.used || !entry.parsedDate) return false;
          return entry.parsedDate.getTime() === date.getTime();
        });
      }

      if (!candidate) {
        candidate = entries.find((entry) => !entry.used);
      }

      if (candidate) {
        candidate.used = true;
        return candidate;
      }
      return null;
    };

    type VerificationCandidate = {
      id: string;
      milestoneId: number;
      milestoneName: string;
      isoDate: string;
      date: Date;
      pointsDelta: number;
      fundsDelta: number;
    };

    const verificationCandidates: VerificationCandidate[] = [];

    historyEntries.forEach((entry) => {
      const payout = findPayoutForEvent(entry.milestoneId, entry.isoDate, entry.date);
      const fundsDelta = payout ? payout.parsedAmount : milestoneAmounts.get(entry.milestoneId) || 0;
      verificationCandidates.push({
        id: `verified-${entry.id}`,
        milestoneId: entry.milestoneId,
        milestoneName: entry.milestoneName,
        isoDate: entry.isoDate,
        date: entry.date,
        pointsDelta: entry.pointsDelta,
        fundsDelta,
      });
    });

    milestones.forEach((milestone) => {
      if (!milestone.verified || !milestone.verifiedAt) {
        return;
      }

      const isoDate = milestone.verifiedAt;
      const date = new Date(isoDate);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const alreadyTracked = verificationCandidates.some((candidate) => {
        if (candidate.milestoneId !== milestone.id) return false;
        return Math.abs(candidate.date.getTime() - date.getTime()) < 1000;
      });

      if (alreadyTracked) {
        return;
      }

      const payout = findPayoutForEvent(milestone.id, isoDate, date);
      const fundsDelta = payout ? payout.parsedAmount : milestoneAmounts.get(milestone.id) || 0;

      verificationCandidates.push({
        id: `verified-fallback-${milestone.id}-${isoDate}`,
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        isoDate,
        date,
        pointsDelta: 0,
        fundsDelta,
      });
    });

    verificationCandidates.sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      if (a.milestoneId !== b.milestoneId) {
        return a.milestoneId - b.milestoneId;
      }
      return a.id.localeCompare(b.id);
    });

    let runningPointsTotal = 0;
    let runningFundsTotal = 0;
    verificationCandidates.forEach((candidate) => {
      runningPointsTotal += candidate.pointsDelta;
      runningFundsTotal += candidate.fundsDelta;

      const tooltipDate = candidate.date.toLocaleString();
      verifiedEvents.push({
        id: candidate.id,
        type: 'verified',
        milestoneId: candidate.milestoneId,
        milestoneName: candidate.milestoneName,
        isoDate: candidate.isoDate,
        date: candidate.date,
        cumulativePoints: runningPointsTotal,
        pointsDelta: candidate.pointsDelta,
        cumulativeFunds: runningFundsTotal,
        fundsDelta: candidate.fundsDelta,
        x: 0,
        y: 0,
        tooltipDate,
      });
    });

    const getCumulativePointsBefore = (targetDate: Date) => {
      let value = 0;
      for (let index = 0; index < verifiedEvents.length; index += 1) {
        const event = verifiedEvents[index];
        if (event.date.getTime() <= targetDate.getTime()) {
          value = event.cumulativePoints;
        } else {
          break;
        }
      }
      return value;
    };

    const getCumulativeFundsBefore = (targetDate: Date) => {
      let value = 0;
      for (let index = 0; index < verifiedEvents.length; index += 1) {
        const event = verifiedEvents[index];
        if (event.date.getTime() <= targetDate.getTime()) {
          value = event.cumulativeFunds;
        } else {
          break;
        }
      }
      return value;
    };

    milestones.forEach((milestone) => {
      const isoDate = milestone.completedAt;
      if (!isoDate) return;
      const date = new Date(isoDate);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const tooltipDate = date.toLocaleString();
      const cumulativePoints = getCumulativePointsBefore(date);
      const cumulativeFunds = getCumulativeFundsBefore(date);

      events.push({
        id: `completed-${milestone.id}-${isoDate}`,
        type: 'completed',
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        isoDate,
        date,
        cumulativePoints,
        pointsDelta: 0,
        cumulativeFunds,
        fundsDelta: 0,
        x: 0,
        y: 0,
        tooltipDate,
      });
    });

    events.push(...verifiedEvents);

    const computeYAxisLabel = () => {
      if (metric === 'funds') {
        return valueMode === 'cumulative'
          ? 'Cumulative Released Funds (USD)'
          : 'Released Funds per Milestone (USD)';
      }
      return valueMode === 'cumulative'
        ? 'Cumulative LEED Points'
        : 'LEED Points Earned per Milestone';
    };

    if (events.length === 0) {
      return {
        events: [] as TimelineEvent[],
        linePath: '',
        xTicks: [] as { x: number; label: string }[],
        yTicks: [] as number[],
        yAxisLabel: computeYAxisLabel(),
      };
    }

    events.sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      if (a.type === b.type) return a.milestoneId - b.milestoneId;
      return a.type === 'completed' ? -1 : 1;
    });

    const minTime = events.reduce((min, event) => Math.min(min, event.date.getTime()), Number.POSITIVE_INFINITY);
    const maxTime = events.reduce((max, event) => Math.max(max, event.date.getTime()), Number.NEGATIVE_INFINITY);
    const timeRange = Math.max(1, maxTime - minTime);

    const maxValue = events.reduce((max, event) => {
      const candidate = (() => {
        if (metric === 'funds') {
          return valueMode === 'cumulative' ? event.cumulativeFunds : event.fundsDelta;
        }
        return valueMode === 'cumulative' ? event.cumulativePoints : event.pointsDelta;
      })();
      return Math.max(max, candidate);
    }, 0);
    const safeMaxValue = Math.max(maxValue, 1);
    const valueRange = safeMaxValue;

    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const eventsWithPosition = events.map((event) => {
      const yValue = (() => {
        if (metric === 'funds') {
          return valueMode === 'cumulative' ? event.cumulativeFunds : event.fundsDelta;
        }
        return valueMode === 'cumulative' ? event.cumulativePoints : event.pointsDelta;
      })();
      const x =
        padding.left +
        ((event.date.getTime() - minTime) / timeRange) * innerWidth;
      const y =
        chartHeight -
        padding.bottom -
        (valueRange === 0 ? 0 : (yValue / valueRange) * innerHeight);

      return {
        ...event,
        x,
        y,
      };
    });

    const verifiedPoints = eventsWithPosition.filter((event) => event.type === 'verified');
    const linePath = verifiedPoints
      .map((event, index) => `${index === 0 ? 'M' : 'L'}${event.x},${event.y}`)
      .join(' ');

    const filteredEvents =
      eventFilter === 'all'
        ? eventsWithPosition
        : eventsWithPosition.filter((event) => event.type === 'verified');

    const tickCount = Math.min(5, Math.max(2, eventsWithPosition.length));
    const xTicks: { x: number; label: string }[] = [];
    if (tickCount > 0) {
      for (let index = 0; index < tickCount; index += 1) {
        const ratio = tickCount === 1 ? 0 : index / (tickCount - 1);
        const tickTime = minTime + ratio * (maxTime - minTime);
        const tickDate = new Date(tickTime);
        const diffMs = tickTime - minTime;
        const totalMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const relativeLabel = `${hours}:${minutes.toString().padStart(2, '0')}`;
        const absoluteLabel = tickDate.toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });

        xTicks.push({
          x: padding.left + ratio * innerWidth,
          label: `${relativeLabel} • ${absoluteLabel}`,
        });
      }
    }

    const yTicks: number[] = [];
    if (valueRange > 0) {
      yTicks.push(0);
      const midPoint = Math.round(valueRange / 2);
      if (midPoint > 0 && midPoint < valueRange) {
        yTicks.push(midPoint);
      }
      if (!yTicks.includes(valueRange)) {
        yTicks.push(valueRange);
      }
    }

    const yAxisLabel = computeYAxisLabel();

    return {
      events: filteredEvents,
      linePath,
      xTicks,
      yTicks,
      yAxisLabel,
    };
  }, [eventFilter, milestones, metric, payoutHistory, scorecard, valueMode]);

  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const hoveredEvent = timeline.events.find((event) => event.id === hoveredEventId) || null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Project Activity Timeline</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track milestone progress and LEED point verification over time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-blue-500" aria-hidden="true"></span>
            <span>Milestone Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-green-500" aria-hidden="true"></span>
            <span>Milestone Verified</span>
          </div>
          <label className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-gray-500">Show</span>
            <select
              value={eventFilter}
              onChange={(event) =>
                setEventFilter(event.target.value === 'verified' ? 'verified' : 'all')
              }
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Completed & Verified</option>
              <option value="verified">Verified Only</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-gray-500">Metric</span>
            <select
              value={metric}
              onChange={(event) =>
                setMetric(event.target.value === 'points' ? 'points' : 'funds')
              }
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="funds">Released Funds</option>
              <option value="points">LEED Points</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-gray-500">Display</span>
            <select
              value={valueMode}
              onChange={(event) =>
                setValueMode(event.target.value === 'cumulative' ? 'cumulative' : 'individual')
              }
              className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cumulative">
                {metric === 'funds' ? 'Cumulative Released' : 'Cumulative Points'}
              </option>
              <option value="individual">
                {metric === 'funds' ? 'Per Milestone Released' : 'Points per Milestone'}
              </option>
            </select>
          </label>
        </div>
      </div>

      {timeline.events.length === 0 ? (
        <div className="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-6 text-center">
          Once milestones are completed or verified, they will appear here as interactive pins on the timeline.
        </div>
      ) : (
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full text-gray-400"
            role="img"
            aria-label="Timeline chart showing milestone completion and verification activity"
          >
            <line
              x1={padding.left}
              y1={chartHeight - padding.bottom}
              x2={chartWidth - padding.right}
              y2={chartHeight - padding.bottom}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={chartHeight - padding.bottom}
              stroke="currentColor"
              strokeWidth={1}
              strokeDasharray="4 4"
            />

            {timeline.yTicks.map((tick) => {
              const y =
                chartHeight -
                padding.bottom -
                ((tick / (timeline.yTicks[timeline.yTicks.length - 1] || 1)) *
                  (chartHeight - padding.top - padding.bottom));
              return (
                <g key={`y-${tick}`}>
                  <line
                    x1={padding.left - 6}
                    y1={y}
                    x2={padding.left}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth={1}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-gray-500 text-xs"
                  >
                    {metric === 'funds'
                      ? `$${tick.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : tick}
                  </text>
                </g>
              );
            })}

            {timeline.xTicks.map((tick) => (
              <g key={`x-${tick.x}`}>
                <line
                  x1={tick.x}
                  y1={chartHeight - padding.bottom}
                  x2={tick.x}
                  y2={chartHeight - padding.bottom + 6}
                  stroke="currentColor"
                  strokeWidth={1}
                />
                <text
                  x={tick.x}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  className="fill-gray-500 text-xs"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {timeline.linePath && (
              <path
                d={timeline.linePath}
                fill="none"
                stroke="#16a34a"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            <text
              x={padding.left}
              y={padding.top - 8}
              className="fill-gray-500 text-xs font-medium"
              textAnchor="start"
            >
              {timeline.yAxisLabel}
            </text>
          </svg>

          {timeline.events.map((event) => {
            const leftPercent = (event.x / chartWidth) * 100;
            const topPercent = (event.y / chartHeight) * 100;
            const isVerified = event.type === 'verified';

            return (
              <button
                key={event.id}
                type="button"
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-lg transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  isVerified
                    ? 'bg-green-500 border-white focus-visible:ring-green-500'
                    : 'bg-blue-500 border-white focus-visible:ring-blue-500'
                } ${hoveredEventId === event.id ? 'scale-110' : 'scale-100'}`}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  width: isVerified ? '18px' : '14px',
                  height: isVerified ? '18px' : '14px',
                }}
                onMouseEnter={() => setHoveredEventId(event.id)}
                onFocus={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId((current) => (current === event.id ? null : current))}
                onBlur={() => setHoveredEventId((current) => (current === event.id ? null : current))}
                onClick={() => onSelectMilestone?.(event.milestoneId)}
                aria-label={`${event.milestoneName} ${
                  isVerified ? 'verified' : 'completed'
                } on ${event.tooltipDate}`}
              ></button>
            );
          })}

          {hoveredEvent && (
            <div
              className="absolute z-10 w-64 rounded-lg border border-gray-200 bg-white p-4 text-left shadow-xl"
              style={{
                left: `${(hoveredEvent.x / chartWidth) * 100}%`,
                top: `${(hoveredEvent.y / chartHeight) * 100}%`,
                transform: 'translate(-50%, calc(-100% - 16px))',
              }}
            >
              <p className="text-xs uppercase tracking-wide text-gray-400">
                {hoveredEvent.type === 'verified' ? 'Milestone Verified' : 'Milestone Completed'}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{hoveredEvent.milestoneName}</p>
              <p className="text-xs text-gray-500">{hoveredEvent.tooltipDate}</p>
              {hoveredEvent.type === 'verified' ? (
                <div className="mt-3 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
                  {hoveredEvent.pointsDelta > 0 && (
                    <p className="font-medium">
                      +{hoveredEvent.pointsDelta.toLocaleString()} LEED pts
                    </p>
                  )}
                  {hoveredEvent.cumulativePoints > 0 && (
                    <p>Cumulative: {hoveredEvent.cumulativePoints.toLocaleString()} pts</p>
                  )}
                  {hoveredEvent.fundsDelta > 0 && (
                    <p className="mt-2 font-medium">
                      +${hoveredEvent.fundsDelta.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  )}
                  {hoveredEvent.cumulativeFunds > 0 && (
                    <p>
                      Released Total: $
                      {hoveredEvent.cumulativeFunds.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-500">
                  Verification pending for LEED point confirmation.
                </p>
              )}
              <p className="mt-3 text-xs font-medium text-green-600">
                Click to open milestone details
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

