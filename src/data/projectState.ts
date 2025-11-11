// src/data/projectState.ts

import { getInitialProjects } from './mockProjects';
import {
  InvestmentTransaction,
  Milestone,
  MilestoneReleaseTransaction,
  Project,
} from './projectTypes';

type ProjectDictionary = Record<number, Project>;

const cloneMilestone = (milestone: Milestone): Milestone => ({
  ...milestone,
  documents: [...milestone.documents],
});

const cloneInvestmentTransaction = (
  transaction: InvestmentTransaction
): InvestmentTransaction => ({
  ...transaction,
});

const cloneMilestoneReleaseTransaction = (
  transaction: MilestoneReleaseTransaction
): MilestoneReleaseTransaction => ({
  ...transaction,
});

const cloneProject = (project: Project): Project => ({
  ...project,
  projectWalletBalance: project.projectWalletBalance ?? '0',
  milestones: (project.milestones ?? []).map(cloneMilestone),
  investmentHistory: (project.investmentHistory ?? []).map(cloneInvestmentTransaction),
  milestoneReleaseHistory: (project.milestoneReleaseHistory ?? []).map(
    cloneMilestoneReleaseTransaction
  ),
});

const mergeMilestones = (
  initialMilestones: Milestone[] | undefined,
  savedMilestones: Milestone[] | undefined
): Milestone[] => {
  const initialById = new Map((initialMilestones ?? []).map((milestone) => [milestone.id, milestone]));
  const source = savedMilestones ?? initialMilestones ?? [];

  return source.map((milestone) => {
    const base = initialById.get(milestone.id);
    const merged = cloneMilestone({
      ...(base ? cloneMilestone(base) : milestone),
      ...milestone,
    });

    if (!merged.completed) {
      merged.completedAt = null;
    }
    if (!merged.verified) {
      merged.verifiedAt = null;
    }

    return merged;
  });
};

const mergeProject = (initial?: Project, persisted?: Project): Project | null => {
  if (!initial && !persisted) {
    return null;
  }

  const base = initial ? cloneProject(initial) : persisted ? cloneProject(persisted) : null;
  if (!base) {
    return null;
  }

  if (!persisted) {
    base.projectWalletBalance = base.projectWalletBalance ?? '0';
    base.milestones = mergeMilestones(initial?.milestones, initial?.milestones);
    base.investmentHistory = (initial?.investmentHistory ?? []).map(cloneInvestmentTransaction);
    base.milestoneReleaseHistory = (initial?.milestoneReleaseHistory ?? []).map(
      cloneMilestoneReleaseTransaction
    );
    return base;
  }

  const merged: Project = {
    ...base,
    ...cloneProject(persisted),
    milestones: mergeMilestones(initial?.milestones, persisted.milestones),
    impactMetrics: persisted.impactMetrics ?? initial?.impactMetrics ?? base.impactMetrics,
    projectWalletBalance:
      persisted.projectWalletBalance ?? initial?.projectWalletBalance ?? base.projectWalletBalance ?? '0',
    investmentHistory: (persisted.investmentHistory ?? initial?.investmentHistory ?? []).map(
      cloneInvestmentTransaction
    ),
    milestoneReleaseHistory: (
      persisted.milestoneReleaseHistory ?? initial?.milestoneReleaseHistory ?? []
    ).map(cloneMilestoneReleaseTransaction),
  };

  if (!merged.projectWalletBalance) {
    merged.projectWalletBalance = '0';
  }

  return merged;
};

const buildInitialDictionary = (): ProjectDictionary => {
  const initial = getInitialProjects();
  return Object.keys(initial).reduce<ProjectDictionary>((acc, key) => {
    const numericKey = Number(key);
    acc[numericKey] = cloneProject(initial[numericKey]);
    return acc;
  }, {} as ProjectDictionary);
};

// Load projects from localStorage or use initial data
export const loadProjects = (): ProjectDictionary => {
  const baseProjects = buildInitialDictionary();

  if (typeof window === 'undefined') {
    return baseProjects;
  }

  const saved = localStorage.getItem('retrofit-projects');
  if (!saved) {
    return baseProjects;
  }

  try {
    const parsed = JSON.parse(saved) as ProjectDictionary;
    return Object.keys({ ...baseProjects, ...parsed }).reduce<ProjectDictionary>((acc, key) => {
      const numericKey = Number(key);
      const merged = mergeProject(baseProjects[numericKey], parsed[numericKey]);
      if (merged) {
        acc[numericKey] = merged;
      }
      return acc;
    }, {} as ProjectDictionary);
  } catch (error) {
    console.error('Failed to parse stored retrofit projects', error);
    return baseProjects;
  }
};

// Save projects to localStorage
export const saveProjects = (projects: ProjectDictionary) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('retrofit-projects', JSON.stringify(projects));
  }
};

const createTransactionId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Update project investment
export const updateProjectInvestment = (
  projectId: number,
  investmentAmount: string,
  investorAddress?: string
): Project | null => {
  const projects = loadProjects();
  const project = projects[projectId];
  if (!project) {
    return null;
  }

  const currentRaised = parseFloat(project.raisedAmount);
  const newInvestment = parseFloat(investmentAmount);
  project.raisedAmount = (currentRaised + newInvestment).toFixed(2);

  const currentInvestors = parseInt(project.investorCount);
  project.investorCount = (currentInvestors + 1).toString();

  const transaction: InvestmentTransaction = {
    id: createTransactionId(),
    amount: investmentAmount,
    investorAddress: investorAddress || '0x0000000000000000000000000000000000000000',
    timestamp: new Date().toISOString(),
  };

  project.investmentHistory = [...(project.investmentHistory ?? []), transaction];

  saveProjects(projects);
  return cloneProject(project);
};

// Update milestone status
export const updateMilestone = (
  projectId: number,
  milestoneId: number,
  updates: Partial<Milestone>
) => {
  const projects = loadProjects();
  const project = projects[projectId];
  if (!project) {
    return null;
  }

  const milestone = project.milestones.find((m: Milestone) => m.id === milestoneId);
  if (!milestone) {
    return null;
  }

  const wasCompleted = milestone.completed;
  const wasVerified = milestone.verified;

  Object.assign(milestone, updates);

  if (!wasCompleted && milestone.completed) {
    milestone.completedAt = new Date().toISOString();
  } else if (wasCompleted && !milestone.completed) {
    milestone.completedAt = null;
  }

  const currentBalance = parseFloat(project.projectWalletBalance || '0');
  const milestoneAmount = parseFloat(milestone.amount || '0');
  const normalizedAmount = Number.isNaN(milestoneAmount) ? 0 : milestoneAmount;

  if (!wasVerified && milestone.verified) {
    project.projectWalletBalance = (currentBalance + normalizedAmount).toFixed(2);
    milestone.verifiedAt = new Date().toISOString();
    const releaseTransaction: MilestoneReleaseTransaction = {
      id: createTransactionId(),
      milestoneId: milestone.id,
      milestoneName: milestone.name,
      amount: milestone.amount,
      timestamp: milestone.verifiedAt,
    };
    project.milestoneReleaseHistory = [
      ...(project.milestoneReleaseHistory ?? []),
      releaseTransaction,
    ];
  } else if (wasVerified && !milestone.verified) {
    const updatedBalance = Math.max(currentBalance - normalizedAmount, 0);
    project.projectWalletBalance = updatedBalance.toFixed(2);
    milestone.verifiedAt = null;
  }

  if (!milestone.completed) {
    milestone.completedAt = null;
  }
  if (!milestone.verified) {
    milestone.verifiedAt = null;
  }

  saveProjects(projects);
  return cloneMilestone(milestone);
};

export const resetMilestone = (projectId: number, milestoneId: number) => {
  return updateMilestone(projectId, milestoneId, {
    completed: false,
    verified: false,
    proofHash: '',
    documents: [],
  });
};

export const resetProjectFundraising = (projectId: number): Project | null => {
  const projects = loadProjects();
  const project = projects[projectId];
  if (!project) {
    return null;
  }

  project.raisedAmount = '0';
  project.investorCount = '0';
  project.investmentHistory = [];

  saveProjects(projects);
  return cloneProject(project);
};

// Get all projects as array
export const getAllProjects = (): Project[] => {
  const projects = loadProjects();
  return Object.values(projects).map(cloneProject);
};

// Get single project
export const getProject = (projectId: number): Project | null => {
  const projects = loadProjects();
  const project = projects[projectId];
  return project ? cloneProject(project) : null;
};
