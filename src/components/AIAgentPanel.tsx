'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAllProjects, Project } from '@/data/projectState';

interface AIAgentPanelProps {
  project: Project;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  content: string;
}

const formatCurrency = (value: string | number) => {
  const numericValue = typeof value === 'number' ? value : Number.parseFloat(value);
  if (Number.isNaN(numericValue)) {
    return '—';
  }

  return `$${numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatPercentage = (value?: string) => {
  if (!value) {
    return '—';
  }

  return value.endsWith('%') ? value : `${value}%`;
};

const createBenchmarkSummary = (project: Project, peers: Project[]) => {
  if (peers.length === 0) {
    return `I do not have another active project to benchmark ${project.name} against yet, but I can still explain its fundamentals.`;
  }

  const peerReturns = peers
    .map((peer) => Number.parseFloat(peer.expectedReturn))
    .filter((value) => !Number.isNaN(value));
  const peerTargets = peers
    .map((peer) => Number.parseFloat(peer.targetAmount))
    .filter((value) => !Number.isNaN(value));
  const peerDurations = peers
    .map((peer) => Number.parseFloat(peer.duration))
    .filter((value) => !Number.isNaN(value));

  const averageReturn = peerReturns.length
    ? peerReturns.reduce((sum, value) => sum + value, 0) / peerReturns.length
    : null;
  const averageTarget = peerTargets.length
    ? peerTargets.reduce((sum, value) => sum + value, 0) / peerTargets.length
    : null;
  const averageDuration = peerDurations.length
    ? peerDurations.reduce((sum, value) => sum + value, 0) / peerDurations.length
    : null;

  const projectReturn = Number.parseFloat(project.expectedReturn);
  const projectTarget = Number.parseFloat(project.targetAmount);
  const projectDuration = Number.parseFloat(project.duration);

  const returnComparison = !Number.isNaN(projectReturn) && averageReturn !== null
    ? projectReturn > averageReturn
      ? 'above the portfolio average expected return'
      : projectReturn < averageReturn
        ? 'slightly below the portfolio average expected return'
        : 'matching the portfolio average expected return'
    : null;

  const targetComparison = !Number.isNaN(projectTarget) && averageTarget !== null
    ? projectTarget > averageTarget
      ? 'larger than'
      : projectTarget < averageTarget
        ? 'smaller than'
        : 'in line with'
    : null;

  const durationComparison = !Number.isNaN(projectDuration) && averageDuration !== null
    ? projectDuration > averageDuration
      ? 'longer than'
      : projectDuration < averageDuration
        ? 'shorter than'
        : 'equal to'
    : null;

  return [
    `Benchmarking ${project.name}:`,
    returnComparison
      ? `• Its ${formatPercentage(project.expectedReturn)} expected return is ${returnComparison} (${averageReturn?.toFixed(1)}% avg).`
      : null,
    targetComparison
      ? `• The funding target of ${formatCurrency(project.targetAmount)} is ${targetComparison} the typical raise (${averageTarget?.toFixed(0)} avg).`
      : null,
    durationComparison
      ? `• The payback horizon of ${project.duration} is ${durationComparison} similar projects (${averageDuration?.toFixed(0)} months avg).`
      : null,
    `• ${project.impactMetrics.annualCO2Reduction.toLocaleString()} tons of CO₂ avoided annually keeps the impact story competitive across the pipeline.`,
  ]
    .filter(Boolean)
    .join('\n');
};

const buildAgentReply = (question: string, project: Project, peers: Project[]) => {
  const normalized = question.toLowerCase();

  if (normalized.includes('benchmark') || normalized.includes('compare') || normalized.includes('vs')) {
    return createBenchmarkSummary(project, peers);
  }

  if (normalized.includes('return') || normalized.includes('roi') || normalized.includes('investment')) {
    return `For ${project.name}, investors are targeting ${formatPercentage(project.expectedReturn)} over a ${project.duration} horizon. The project has already raised ${formatCurrency(project.raisedAmount)} toward a ${formatCurrency(project.targetAmount)} goal, with ${project.investorCount} participating wallets so far.`;
  }

  if (normalized.includes('impact') || normalized.includes('co2') || normalized.includes('sustainability')) {
    const metrics = project.impactMetrics;
    return `Impact snapshot: ${metrics.annualCO2Reduction.toLocaleString()} tons of CO₂ are avoided each year, energy consumption drops roughly ${metrics.energySavings}% after the retrofit, and ${metrics.jobsCreated} local jobs are supported. The project is tracking toward ${metrics.leedCertification} certification.`;
  }

  if (normalized.includes('company') || normalized.includes('team') || normalized.includes('retrofit')) {
    return 'RetroFit curates and tokenizes deep energy retrofits so that investors can co-fund verified upgrades. Each project is held in a dedicated treasury wallet, with progress verified milestone-by-milestone before funds are released.';
  }

  if (normalized.includes('milestone') || normalized.includes('timeline') || normalized.includes('schedule')) {
    const nextMilestone = project.milestones.find((milestone) => !milestone.completed);
    if (nextMilestone) {
      return `Next milestone in queue: "${nextMilestone.name}" for ${formatCurrency(nextMilestone.amount)}. Once the delivery team uploads documentation, RetroFit verifies the proof hash before releasing funds to ${project.projectWalletAddress}.`;
    }
    return 'All milestones for this project have been verified and released. Investors are now monitoring performance metrics and cash distributions.';
  }

  return `Here is a quick briefing on ${project.name}: ${project.description}. Investors expect ${formatPercentage(project.expectedReturn)} returns over ${project.duration}. On the impact side, it eliminates ${project.impactMetrics.annualCO2Reduction.toLocaleString()} tons of CO₂ annually and is pursuing ${project.impactMetrics.leedCertification} accreditation. Let me know if you want comparisons or deeper diligence on milestones, funding, or impact.`;
};

const INITIAL_SUGGESTIONS = [
  'What impact metrics stand out for this project?',
  'How does this project compare to others on expected returns?',
  'Walk me through the next milestone release.',
  'Who operates the Retrofit platform?'
];

export default function AIAgentPanel({ project }: AIAgentPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'intro',
      sender: 'agent',
      content: `Hi! I am the RetroFit Insight Agent assigned to ${project.name}. Ask me about funding, impact metrics, or how it stacks up against the rest of the pipeline.`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const projects = getAllProjects();
    setAvailableProjects(projects);
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: 'intro',
        sender: 'agent',
        content: `Hi! I am the RetroFit Insight Agent assigned to ${project.name}. Ask me about funding, impact metrics, or how it stacks up against the rest of the pipeline.`,
      },
    ]);
  }, [project.id, project.name]);

  const peerProjects = useMemo(
    () => availableProjects.filter((item) => item.id !== project.id),
    [availableProjects, project.id]
  );

  const handleSendMessage = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    window.setTimeout(() => {
      const replyContent = buildAgentReply(trimmed, project, peerProjects);
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        content: replyContent,
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsThinking(false);
    }, 550);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <section
      className={`fixed bottom-4 right-4 left-4 md:left-auto md:right-6 md:bottom-6 md:w-96 z-40 bg-white rounded-xl shadow-2xl border border-green-100 transition-all ${isCollapsed ? 'p-4' : 'p-6'}`}
      role="complementary"
      aria-label="RetroFit Insight Agent"
      aria-expanded={!isCollapsed}
    >
      <div className={`flex items-start justify-between gap-4 ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">RetroFit Insight Agent</h2>
          {!isCollapsed && (
            <p className="text-sm text-gray-600 mt-1">
              Ask about funding performance, sustainability metrics, or benchmark this project against others in the pipeline.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            Always-on
          </span>
          <button
            type="button"
            onClick={toggleCollapsed}
            className="text-xs font-semibold text-green-700 hover:text-green-900"
            aria-pressed={isCollapsed}
            aria-label={isCollapsed ? 'Expand RetroFit Insight Agent panel' : 'Collapse RetroFit Insight Agent panel'}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${message.sender === 'agent' ? 'bg-green-50 text-green-900 border border-green-100' : 'bg-gray-100 text-gray-900 self-end ml-auto'}`}
              >
                {message.content.split('\n').map((line, index) => (
                  <p key={`${message.id}-${index}`} className="whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            ))}
            {isThinking && (
              <div className="rounded-lg px-4 py-3 text-sm bg-green-50 text-green-800 border border-green-100">
                Thinking through portfolio data…
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="text-xs uppercase font-semibold text-gray-500 mb-2">Quick questions</div>
            <div className="flex flex-wrap gap-2">
              {INITIAL_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm px-3 py-2 rounded-full border border-green-200 text-green-700 hover:bg-green-50 transition"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Ask the agent about this project…"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Ask the RetroFit Insight Agent"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition disabled:bg-gray-300"
              disabled={isThinking}
            >
              Send
            </button>
          </form>
        </>
      )}
    </section>
  );
}
