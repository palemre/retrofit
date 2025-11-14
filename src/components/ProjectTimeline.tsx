// src/components/ProjectTimeline.tsx
'use client';

import { useMemo, useState } from 'react';
import type { LeedScorecard, Milestone } from '@/data/projectState';

interface ProjectTimelineProps {
  milestones?: Milestone[];
  scorecard?: LeedScorecard;
  onSelectMilestone?: (milestoneId: number) => void;
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
  x: number;
  y: number;
  tooltipDate: string;
}

interface TimelineEventWithDisplay extends TimelineEvent {
  displayPoints: number;
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

type PointsMode = 'cumulative' | 'milestone';

export default function ProjectTimeline({ milestones = [], scorecard, onSelectMilestone }: ProjectTimelineProps) {
  const [pointsMode, setPointsMode] = useState<PointsMode>('cumulative');

  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [];
    const verifiedEvents: TimelineEvent[] = [];

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

    let runningTotal = 0;
    historyEntries.forEach((entry) => {
      runningTotal += entry.pointsDelta;
      const tooltipDate = entry.date.toLocaleString();
      verifiedEvents.push({
        id: `verified-${entry.id}`,
        type: 'verified',
        milestoneId: entry.milestoneId,
        milestoneName: entry.milestoneName,
        isoDate: entry.isoDate,
        date: entry.date,
        cumulativePoints: runningTotal,
        pointsDelta: entry.pointsDelta,
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

    milestones.forEach((milestone) => {
      const isoDate = milestone.completedAt;
      if (!isoDate) return;
      const date = new Date(isoDate);
      if (Number.isNaN(date.getTime())) {
        return;
      }

      const tooltipDate = date.toLocaleString();
      const cumulativePoints = getCumulativePointsBefore(date);

      events.push({
        id: `completed-${milestone.id}-${isoDate}`,
        type: 'completed',
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        isoDate,
        date,
        cumulativePoints,
        pointsDelta: 0,
        x: 0,
        y: 0,
        tooltipDate,
      });
    });

    events.push(...verifiedEvents);

    if (events.length === 0) {
      return {
        events: [] as TimelineEventWithDisplay[],
        linePath: '',
        xTicks: [] as { x: number; label: string }[],
        yTicks: [] as number[],
        pointsRange: 1,
        maxPoints: 0,
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
    const sameTimestamp = minTime === maxTime;
    const paddedMin = minTime;
    const paddedMax = sameTimestamp ? maxTime + 60 * 60 * 1000 : maxTime;
    const timeRange = Math.max(1, paddedMax - paddedMin);

    const eventsWithDisplayValue: TimelineEventWithDisplay[] = events.map((event) => ({
      ...event,
      displayPoints:
        pointsMode === 'cumulative'
          ? event.cumulativePoints
          : event.type === 'verified'
          ? event.pointsDelta
          : 0,
    }));

    const maxPoints = eventsWithDisplayValue.reduce(
      (max, event) => Math.max(max, event.displayPoints),
      0
    );
    const scaleMax = Math.max(maxPoints, 1);

    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const eventsWithPosition = eventsWithDisplayValue.map((event) => {
      const x =
        padding.left +
        ((event.date.getTime() - paddedMin) / timeRange) * innerWidth;
      const y =
        chartHeight -
        padding.bottom -
        (scaleMax === 0 ? 0 : (event.displayPoints / scaleMax) * innerHeight);

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

    const tickCount = Math.min(4, Math.max(2, eventsWithPosition.length));
    const xTicks: { x: number; label: string }[] = [];
    if (tickCount > 0) {
      const step = tickCount === 1 ? 0 : 1 / (tickCount - 1);
      for (let index = 0; index < tickCount; index += 1) {
        const ratio = step * index;
        const targetTime = paddedMin + ratio * timeRange;
        const x = padding.left + ratio * innerWidth;
        const date = new Date(targetTime);
        xTicks.push({
          x,
          label: date.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          }),
        });
      }
    }

    const yTicks: number[] = [];
    if (scaleMax > 0) {
      const tickValues = [0];
      if (maxPoints > 0) {
        const midPoint = Math.round(scaleMax / 2);
        if (midPoint > 0 && midPoint < scaleMax) {
          tickValues.push(midPoint);
        }
        if (!tickValues.includes(scaleMax)) {
          tickValues.push(scaleMax);
        }
      }
      yTicks.push(...tickValues);
    }

    return {
      events: eventsWithPosition,
      linePath,
      xTicks,
      yTicks,
      pointsRange: scaleMax,
      maxPoints,
    };
  }, [milestones, scorecard, pointsMode]);

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
        <div className="flex flex-col items-start gap-3 text-sm text-gray-600 md:items-end">
          <div className="inline-flex rounded-full border border-gray-200 bg-gray-100 p-1 text-xs font-medium text-gray-600">
            <button
              type="button"
              onClick={() => setPointsMode('cumulative')}
              className={`px-3 py-1 rounded-full transition ${
                pointsMode === 'cumulative'
                  ? 'bg-white text-gray-900 shadow'
                  : 'hover:bg-white/70'
              }`}
            >
              Cumulative Points
            </button>
            <button
              type="button"
              onClick={() => setPointsMode('milestone')}
              className={`px-3 py-1 rounded-full transition ${
                pointsMode === 'milestone'
                  ? 'bg-white text-gray-900 shadow'
                  : 'hover:bg-white/70'
              }`}
            >
              Milestone Points
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-blue-500" aria-hidden="true"></span>
            <span>Milestone Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-green-500" aria-hidden="true"></span>
            <span>Milestone Verified</span>
          </div>
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
                (timeline.pointsRange === 0
                  ? 0
                  : (tick / timeline.pointsRange) * (chartHeight - padding.top - padding.bottom));
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
                    {tick}
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
              {pointsMode === 'cumulative'
                ? 'Cumulative LEED Points'
                : 'LEED Points Awarded per Milestone'}
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
                  {pointsMode === 'milestone' ? (
                    <>
                      <p className="font-medium">
                        {hoveredEvent.pointsDelta.toLocaleString()} LEED pts awarded
                      </p>
                      <p className="text-green-700/80">
                        Cumulative total: {hoveredEvent.cumulativePoints.toLocaleString()} pts
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">
                        +{hoveredEvent.pointsDelta.toLocaleString()} LEED pts
                      </p>
                      <p>Cumulative: {hoveredEvent.cumulativePoints.toLocaleString()} pts</p>
                    </>
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

