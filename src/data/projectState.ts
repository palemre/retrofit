// src/data/projectState.ts

export interface Milestone {
  id: number;
  name: string;
  description: string;
  amount: string;
  completed: boolean;
  verified: boolean;
  completedAt?: string | null;
  verifiedAt?: string | null;
  proofHash: string;
  documents: string[];
}

export interface InvestmentTransaction {
  id: string;
  amount: string;
  date: string;
  investorWallet: string;
}

export interface MilestonePayoutTransaction {
  id: string;
  milestoneId: number;
  milestoneName: string;
  amount: string;
  date: string;
}

export interface ImpactMetrics {
  annualCO2Reduction: number; // tons of CO₂ avoided annually
  energySavings: number; // percentage improvement in efficiency
  jobsCreated: number; // number of local jobs supported
  leedCertification: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  targetAmount: string;
  raisedAmount: string;
  expectedReturn: string;
  duration: string;
  status: string;
  investorCount: string;
  address: string;
  image: string;
  erc1155ContractAddress: string;
  erc1155TokenId: string;
  projectWalletAddress: string;
  projectWalletBalance: string;
  milestones: Milestone[];
  impactMetrics: ImpactMetrics;
  investmentHistory: InvestmentTransaction[];
  milestonePayoutHistory: MilestonePayoutTransaction[];
}

type ProjectDictionary = Record<number, Project>;

const normalizeMilestones = (milestones: Milestone[] = []): Milestone[] =>
  milestones.map((milestone) => ({
    ...milestone,
    proofHash: milestone.proofHash || '',
    documents: milestone.documents || [],
    completedAt: milestone.completedAt ?? null,
    verifiedAt: milestone.verifiedAt ?? null,
  }));

const withProjectDefaults = (project: Project): Project => ({
  ...project,
  projectWalletBalance: project.projectWalletBalance || '0',
  milestones: normalizeMilestones(project.milestones || []),
  investmentHistory: project.investmentHistory || [],
  milestonePayoutHistory: project.milestonePayoutHistory || [],
});

// Initial projects data WITH MILESTONES AND IMPACT METRICS
const initialProjects: ProjectDictionary = {
  1: {
    id: 1,
    name: "Downtown Office Retrofit",
    description: "Solar panel installation and window upgrades for commercial building",
    targetAmount: "50",
    raisedAmount: "0.01",
    expectedReturn: "8.5%",
    duration: "24 months",
    status: "Funding",
    investorCount: "1",
    address: "123 Main St, New York, NY",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
    erc1155ContractAddress: "0x8A4e4A6E2C7cF0d3A9B1d263F4e5F61b7aFf1E21",
    erc1155TokenId: "1",
    projectWalletAddress: "0x3F5b2c1a9D7E8f6C5b4A1234567890dEfA123456",
    projectWalletBalance: "0",
    milestones: normalizeMilestones([
      {
        id: 1,
        name: "Solar Panel Installation",
        description: "Install 100kW solar array on rooftop",
        amount: "25",
        completed: false,
        verified: false,
        completedAt: null,
        verifiedAt: null,
        proofHash: "",
        documents: []
      },
      {
        id: 2,
        name: "Window Upgrades",
        description: "Replace windows with double-paned energy-efficient glass",
        amount: "15",
        completed: false,
        verified: false,
        completedAt: null,
        verifiedAt: null,
        proofHash: "",
        documents: []
      }
    ]),
    impactMetrics: {
      annualCO2Reduction: 128,
      energySavings: 32,
      jobsCreated: 18,
      leedCertification: "LEED Gold"
    },
    investmentHistory: [],
    milestonePayoutHistory: []
  },
  2: {
    id: 2,
    name: "Apartment Complex Green Upgrade",
    description: "HVAC system replacement and insulation for residential building",
    targetAmount: "75",
    raisedAmount: "0",
    expectedReturn: "7.2%",
    duration: "18 months",
    status: "Funding",
    investorCount: "0",
    address: "456 Oak Ave, Chicago, IL",
    image: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400&h=250&fit=crop",
    erc1155ContractAddress: "0x4B6c7D8E9F0a1b2C3d4E5f60718293aB4c5D6e7F",
    erc1155TokenId: "2",
    projectWalletAddress: "0x7C8d9e0F1A2b3c4D5e6F7890aBCdEf1234567890",
    projectWalletBalance: "0",
    milestones: normalizeMilestones([
      {
        id: 1,
        name: "HVAC Replacement",
        description: "Install high-efficiency heating and cooling systems",
        amount: "45",
        completed: false,
        verified: false,
        completedAt: null,
        verifiedAt: null,
        proofHash: "",
        documents: []
      },
      {
        id: 2,
        name: "Building Insulation",
        description: "Add spray foam insulation to attics and walls",
        amount: "30",
        completed: false,
        verified: false,
        completedAt: null,
        verifiedAt: null,
        proofHash: "",
        documents: []
      }
    ]),
    impactMetrics: {
      annualCO2Reduction: 94,
      energySavings: 27,
      jobsCreated: 22,
      leedCertification: "LEED Silver"
    },
    investmentHistory: [],
    milestonePayoutHistory: []
  },
  3: {
    id: 3,
    name: "Historic Building Modernization",
    description: "Energy efficiency upgrades while preserving historic character",
    targetAmount: "100",
    raisedAmount: "0",
    expectedReturn: "9.2%",
    duration: "30 months",
    status: "Funding",
    investorCount: "0",
    address: "789 Heritage Lane, Boston, MA",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=250&fit=crop",
    erc1155ContractAddress: "0x9d0E1F2a3B4c5D6e7F8091a2b3C4d5E6f7A8B9c0",
    erc1155TokenId: "3",
    projectWalletAddress: "0x12a3b4C5d6E7f8A9b0C1D2e3F4567890AbCdEf12",
    projectWalletBalance: "0",
    milestones: normalizeMilestones([]),
    impactMetrics: {
      annualCO2Reduction: 142,
      energySavings: 35,
      jobsCreated: 15,
      leedCertification: "LEED Platinum Pending"
    },
    investmentHistory: [],
    milestonePayoutHistory: []
  }
};

// Load projects from localStorage or use initial data
export const loadProjects = (): ProjectDictionary => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('retrofit-projects');
    if (saved) {
      const parsed = JSON.parse(saved) as ProjectDictionary;
      // Merge saved data with any new fields from the initial definition
      const mergedEntries = Object.keys({ ...initialProjects, ...parsed }).reduce<ProjectDictionary>((acc, key) => {
        const numericKey = Number(key);
        const initialProject = initialProjects[numericKey];
        const savedProject = parsed[numericKey];
        if (initialProject && savedProject) {
          acc[numericKey] = withProjectDefaults({
            ...initialProject,
            ...savedProject,
            milestones: normalizeMilestones(savedProject.milestones || initialProject.milestones),
            impactMetrics: savedProject.impactMetrics || initialProject.impactMetrics,
            investmentHistory: savedProject.investmentHistory || initialProject.investmentHistory || [],
            milestonePayoutHistory: savedProject.milestonePayoutHistory || initialProject.milestonePayoutHistory || [],
          });
        } else {
          const fallbackProject = savedProject || initialProject;
          if (fallbackProject) {
            acc[numericKey] = withProjectDefaults({
              ...fallbackProject,
              milestones: normalizeMilestones(fallbackProject.milestones),
            });
          }
        }
        return acc;
      }, {} as ProjectDictionary);

      return mergedEntries;
    }
  }
  return Object.values(initialProjects).reduce<ProjectDictionary>((acc, project) => {
    acc[project.id] = withProjectDefaults(project);
    return acc;
  }, {} as ProjectDictionary);
};

// Save projects to localStorage
export const saveProjects = (projects: ProjectDictionary) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('retrofit-projects', JSON.stringify(projects));
  }
};

// Update project investment
export const updateProjectInvestment = (
  projectId: number,
  investmentAmount: string,
  investorWallet: string
): Project | null => {
  const projects = loadProjects();
  if (projects[projectId]) {
    const currentRaised = parseFloat(projects[projectId].raisedAmount);
    const newInvestment = parseFloat(investmentAmount);
    projects[projectId].raisedAmount = (currentRaised + newInvestment).toFixed(2);

    const currentInvestors = parseInt(projects[projectId].investorCount);
    projects[projectId].investorCount = (currentInvestors + 1).toString();

    const transaction: InvestmentTransaction = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      amount: investmentAmount,
      date: new Date().toISOString(),
      investorWallet,
    };

    projects[projectId].investmentHistory = [
      ...(projects[projectId].investmentHistory || []),
      transaction,
    ];

    saveProjects(projects);
    return projects[projectId];
  }
  return null;
};

export const resetProjectFunding = (projectId: number): Project | null => {
  const projects = loadProjects();
  if (projects[projectId]) {
    projects[projectId].raisedAmount = '0.00';
    projects[projectId].investorCount = '0';
    saveProjects(projects);
    return projects[projectId];
  }
  return null;
};

// Update milestone status
export const updateMilestone = (
  projectId: number,
  milestoneId: number,
  updates: Partial<Milestone>
) => {
  const projects = loadProjects();
  if (projects[projectId]) {
    const project = projects[projectId];
    if (!project.milestones) project.milestones = [];

    const milestone = project.milestones.find((m: Milestone) => m.id === milestoneId);
    if (milestone) {
      const wasVerified = milestone.verified;
      const wasCompleted = milestone.completed;

      const updatesWithTimestamps: Partial<Milestone> = { ...updates };

      if (updates.completed !== undefined) {
        if (updates.completed && !wasCompleted) {
          updatesWithTimestamps.completedAt = new Date().toISOString();
        } else if (!updates.completed && wasCompleted) {
          updatesWithTimestamps.completedAt = null;
        }
      }

      if (updates.verified !== undefined) {
        if (updates.verified && !wasVerified) {
          updatesWithTimestamps.verifiedAt = new Date().toISOString();
        } else if (!updates.verified && wasVerified) {
          updatesWithTimestamps.verifiedAt = null;
        }
      }

      Object.assign(milestone, updatesWithTimestamps);

      if (!wasVerified && milestone.verified) {
        const currentBalance = parseFloat(project.projectWalletBalance || '0');
        const milestoneAmount = parseFloat(milestone.amount || '0');
        const updatedBalance = currentBalance + (isNaN(milestoneAmount) ? 0 : milestoneAmount);
        project.projectWalletBalance = updatedBalance.toFixed(2);

        const payout: MilestonePayoutTransaction = {
          id: `${milestone.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          milestoneId: milestone.id,
          milestoneName: milestone.name,
          amount: milestone.amount,
          date: milestone.verifiedAt || new Date().toISOString(),
        };

        project.milestonePayoutHistory = [
          ...(project.milestonePayoutHistory || []),
          payout,
        ];
      } else if (wasVerified && !milestone.verified) {
        const currentBalance = parseFloat(project.projectWalletBalance || '0');
        const milestoneAmount = parseFloat(milestone.amount || '0');
        const deduction = isNaN(milestoneAmount) ? 0 : milestoneAmount;
        const updatedBalance = Math.max(0, currentBalance - deduction);
        project.projectWalletBalance = updatedBalance.toFixed(2);

        if (project.milestonePayoutHistory) {
          project.milestonePayoutHistory = project.milestonePayoutHistory.filter(
            (entry) => entry.milestoneId !== milestone.id
          );
        }
      }

      saveProjects(projects);
      return milestone;
    }
  }
  return null;
};

// Get all projects as array
export const getAllProjects = (): Project[] => {
  const projects = loadProjects();
  return Object.values(projects);
};

// Get single project
export const getProject = (projectId: number): Project | null => {
  const projects = loadProjects();
  return projects[projectId] || null;
};
