// src/data/projectState.ts

export interface LeedPointContribution {
  category: string;
  points: number;
  note?: string;
}

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
  leedPointContributions?: LeedPointContribution[];
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

export interface LeedScoreCategory {
  category: string;
  achievedPoints: number;
  availablePoints: number;
  notes?: string;
  baseAchievedPoints?: number;
}

export interface LeedScorecard {
  certificationLevel: string;
  totalPoints: number;
  certificationDate?: string;
  reviewingOrganization?: string;
  scorecardStatus?: string;
  categories: LeedScoreCategory[];
  baseTotalPoints?: number;
  history?: LeedScoreHistoryEntry[];
}

export interface LeedScoreHistoryEntry {
  milestoneId: number;
  milestoneName: string;
  category: string;
  pointsAwarded: number;
  awardedAt: string;
  note?: string;
}

export interface ImpactMetrics {
  annualCO2Reduction: number; // tons of CO₂ avoided annually
  energySavings: number; // percentage improvement in efficiency
  jobsCreated: number; // number of local jobs supported
  leedCertification: string;
  leedScorecard?: LeedScorecard;
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

const recalculateLeedScorecard = (scorecard: LeedScorecard): LeedScorecard => {
  const baseTotal = scorecard.baseTotalPoints ?? scorecard.totalPoints ?? 0;
  const history = scorecard.history ?? [];

  const contributionsByCategory = history.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.pointsAwarded;
    return acc;
  }, {});

  const existingCategories = scorecard.categories || [];

  const categories = existingCategories.map((category) => {
    const base = category.baseAchievedPoints ?? category.achievedPoints ?? 0;
    return {
      ...category,
      baseAchievedPoints: base,
      achievedPoints: base + (contributionsByCategory[category.category] || 0),
    };
  });

  const knownCategoryNames = new Set(categories.map((category) => category.category));
  const additionalCategories = Object.entries(contributionsByCategory)
    .filter(([category]) => !knownCategoryNames.has(category))
    .map(([category, points]) => ({
      category,
      achievedPoints: points,
      availablePoints: points,
      notes: undefined,
      baseAchievedPoints: 0,
    }));

  const totalPoints = baseTotal + history.reduce((sum, entry) => sum + entry.pointsAwarded, 0);

  return {
    ...scorecard,
    baseTotalPoints: baseTotal,
    history,
    categories: [...categories, ...additionalCategories],
    totalPoints,
  };
};

const withLeedScorecardDefaults = (scorecard?: LeedScorecard): LeedScorecard | undefined => {
  if (!scorecard) return undefined;

  const normalized: LeedScorecard = {
    ...scorecard,
    baseTotalPoints: scorecard.baseTotalPoints ?? scorecard.totalPoints ?? 0,
    history: scorecard.history ?? [],
    categories: (scorecard.categories || []).map((category) => ({
      ...category,
      baseAchievedPoints: category.baseAchievedPoints ?? category.achievedPoints ?? 0,
      achievedPoints: category.achievedPoints ?? category.baseAchievedPoints ?? 0,
    })),
  };

  return recalculateLeedScorecard(normalized);
};

const mergeLeedScorecard = (
  initialScorecard?: LeedScorecard,
  savedScorecard?: LeedScorecard
): LeedScorecard | undefined => {
  if (!initialScorecard && !savedScorecard) {
    return undefined;
  }

  const categories = savedScorecard?.categories ?? initialScorecard?.categories ?? [];
  const history = savedScorecard?.history ?? initialScorecard?.history ?? [];

  return withLeedScorecardDefaults({
    ...(initialScorecard || {}),
    ...(savedScorecard || {}),
    categories,
    history,
  });
};

const normalizeMilestones = (milestones: Milestone[] = []): Milestone[] =>
  milestones.map((milestone) => ({
    ...milestone,
    proofHash: milestone.proofHash || '',
    documents: milestone.documents || [],
    completedAt: milestone.completedAt ?? null,
    verifiedAt: milestone.verifiedAt ?? null,
    leedPointContributions: milestone.leedPointContributions || [],
  }));

const withProjectDefaults = (project: Project): Project => ({
  ...project,
  projectWalletBalance: project.projectWalletBalance || '0',
  milestones: normalizeMilestones(project.milestones || []),
  investmentHistory: project.investmentHistory || [],
  milestonePayoutHistory: project.milestonePayoutHistory || [],
  impactMetrics: project.impactMetrics
    ? {
        ...project.impactMetrics,
        leedScorecard: withLeedScorecardDefaults(project.impactMetrics.leedScorecard),
      }
    : project.impactMetrics,
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
        documents: [],
        leedPointContributions: [
          {
            category: "Energy & Atmosphere",
            points: 3,
            note: "Production data validates enhanced renewable energy performance.",
          },
          {
            category: "Innovation",
            points: 1,
            note: "Verified real-time solar performance dashboard in operation.",
          },
        ],
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
        documents: [],
        leedPointContributions: [
          {
            category: "Energy & Atmosphere",
            points: 2,
            note: "Envelope testing confirms improved thermal performance.",
          },
          {
            category: "Indoor Environmental Quality",
            points: 2,
            note: "Daylight and glare analyses exceed post-retrofit thresholds.",
          },
        ],
      }
    ]),
    impactMetrics: {
      annualCO2Reduction: 128,
      energySavings: 32,
      jobsCreated: 18,
      leedCertification: "LEED Gold",
      leedScorecard: {
        certificationLevel: "LEED v4 BD+C: Major Renovation",
        totalPoints: 79,
        certificationDate: "2024-03-18",
        reviewingOrganization: "U.S. Green Building Council",
        scorecardStatus: "Certification Awarded",
        categories: [
          {
            category: "Location & Transportation",
            achievedPoints: 12,
            availablePoints: 16,
            notes: "Transit access, reduced parking footprint, and bike facilities.",
          },
          {
            category: "Sustainable Sites",
            achievedPoints: 8,
            availablePoints: 10,
            notes: "High-performance roof and rainwater management installed.",
          },
          {
            category: "Water Efficiency",
            achievedPoints: 7,
            availablePoints: 11,
            notes: "Fixture upgrades deliver a 36% indoor water use reduction.",
          },
          {
            category: "Energy & Atmosphere",
            achievedPoints: 26,
            availablePoints: 33,
            notes: "Solar array and controls drive a 28% modeled energy cost savings.",
          },
          {
            category: "Materials & Resources",
            achievedPoints: 6,
            availablePoints: 13,
            notes: "Reused existing envelope and tracked EPD-backed materials.",
          },
          {
            category: "Indoor Environmental Quality",
            achievedPoints: 11,
            availablePoints: 16,
            notes: "Daylight sensors and low-VOC finishes improve occupant comfort.",
          },
          {
            category: "Innovation",
            achievedPoints: 5,
            availablePoints: 6,
            notes: "Green cleaning program and education dashboard earn innovation credits.",
          },
          {
            category: "Regional Priority",
            achievedPoints: 4,
            availablePoints: 4,
            notes: "Heat island mitigation aligns with NYSERDA regional priorities.",
          },
        ],
      },
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
        documents: [],
        leedPointContributions: [
          {
            category: "Energy & Atmosphere",
            points: 4,
            note: "Commissioning report confirms modeled HVAC savings achieved.",
          },
          {
            category: "Indoor Environmental Quality",
            points: 1,
            note: "Verified ventilation improvements across occupied units.",
          },
        ],
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
        documents: [],
        leedPointContributions: [
          {
            category: "Energy & Atmosphere",
            points: 2,
            note: "Blower door testing shows airtightness surpasses baseline.",
          },
          {
            category: "Water Efficiency",
            points: 1,
            note: "Thermal envelope enables heat-pump water heater efficiency gains.",
          },
        ],
      }
    ]),
    impactMetrics: {
      annualCO2Reduction: 94,
      energySavings: 27,
      jobsCreated: 22,
      leedCertification: "LEED Silver",
      leedScorecard: {
        certificationLevel: "LEED v4.1 O+M: Multifamily",
        totalPoints: 58,
        certificationDate: "2023-11-07",
        reviewingOrganization: "Green Business Certification Inc.",
        scorecardStatus: "Certification Awarded",
        categories: [
          {
            category: "Location & Transportation",
            achievedPoints: 10,
            availablePoints: 16,
            notes: "Walkable neighborhood with discounted transit passes for residents.",
          },
          {
            category: "Sustainable Sites",
            achievedPoints: 7,
            availablePoints: 10,
            notes: "Native landscaping and light pollution controls verified.",
          },
          {
            category: "Water Efficiency",
            achievedPoints: 6,
            availablePoints: 11,
            notes: "Submetering enables 28% irrigation water reduction.",
          },
          {
            category: "Energy & Atmosphere",
            achievedPoints: 20,
            availablePoints: 33,
            notes: "Geothermal-ready HVAC cut modeled EUI by 24% against baseline.",
          },
          {
            category: "Materials & Resources",
            achievedPoints: 5,
            availablePoints: 13,
            notes: "Waste diversion tracked for 68% of construction waste stream.",
          },
          {
            category: "Indoor Environmental Quality",
            achievedPoints: 8,
            availablePoints: 16,
            notes: "ERV retrofit improves ventilation effectiveness in common areas.",
          },
          {
            category: "Innovation",
            achievedPoints: 2,
            availablePoints: 6,
            notes: "Resident green ambassador program recognized for engagement.",
          },
          {
            category: "Regional Priority",
            achievedPoints: 0,
            availablePoints: 4,
            notes: "Regional stormwater priority pursued but not awarded.",
          },
        ],
      },
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
      leedCertification: "LEED Platinum Pending",
      leedScorecard: {
        certificationLevel: "LEED v4 BD+C: Core & Shell",
        totalPoints: 85,
        scorecardStatus: "Design Review Approved – Construction Review Pending",
        categories: [
          {
            category: "Location & Transportation",
            achievedPoints: 13,
            availablePoints: 16,
            notes: "Transit-oriented development with EV-ready parking projected.",
          },
          {
            category: "Sustainable Sites",
            achievedPoints: 9,
            availablePoints: 10,
            notes: "Green roofs and adaptive reuse of historic facade detailed in plans.",
          },
          {
            category: "Water Efficiency",
            achievedPoints: 9,
            availablePoints: 11,
            notes: "Rainwater harvesting and greywater reuse model a 42% reduction.",
          },
          {
            category: "Energy & Atmosphere",
            achievedPoints: 28,
            availablePoints: 33,
            notes: "Targeting 38% modeled energy cost savings via geothermal and heat recovery.",
          },
          {
            category: "Materials & Resources",
            achievedPoints: 8,
            availablePoints: 13,
            notes: "Adaptive reuse credits combined with EPD-backed finish selections.",
          },
          {
            category: "Indoor Environmental Quality",
            achievedPoints: 12,
            availablePoints: 16,
            notes: "Daylighting analysis meets 75% regularly occupied space threshold.",
          },
          {
            category: "Innovation",
            achievedPoints: 4,
            availablePoints: 6,
            notes: "Biophilic design pattern guide submitted for exemplary performance.",
          },
          {
            category: "Regional Priority",
            achievedPoints: 4,
            availablePoints: 4,
            notes: "Historic preservation and energy grid resiliency both prioritized regionally.",
          },
        ],
      },
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
            impactMetrics: {
              ...(initialProject?.impactMetrics || {}),
              ...(savedProject.impactMetrics || {}),
              leedScorecard: mergeLeedScorecard(
                initialProject?.impactMetrics?.leedScorecard,
                savedProject.impactMetrics?.leedScorecard
              ),
            },
            investmentHistory: savedProject.investmentHistory || initialProject.investmentHistory || [],
            milestonePayoutHistory: savedProject.milestonePayoutHistory || initialProject.milestonePayoutHistory || [],
          });
        } else {
          const fallbackProject = savedProject || initialProject;
          if (fallbackProject) {
            acc[numericKey] = withProjectDefaults({
              ...fallbackProject,
              milestones: normalizeMilestones(fallbackProject.milestones),
              impactMetrics: fallbackProject.impactMetrics
                ? {
                    ...(initialProject?.impactMetrics || {}),
                    ...(fallbackProject.impactMetrics || {}),
                    leedScorecard: mergeLeedScorecard(
                      initialProject?.impactMetrics?.leedScorecard,
                      fallbackProject.impactMetrics?.leedScorecard
                    ),
                  }
                : fallbackProject.impactMetrics,
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

        if (project.impactMetrics?.leedScorecard && milestone.leedPointContributions?.length) {
          const scorecard = project.impactMetrics.leedScorecard;
          const awardedAt = milestone.verifiedAt || new Date().toISOString();
          const filteredHistory = (scorecard.history || []).filter(
            (entry) => entry.milestoneId !== milestone.id
          );
          const newEntries = milestone.leedPointContributions.map((contribution) => ({
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            category: contribution.category,
            pointsAwarded: contribution.points,
            awardedAt,
            note: contribution.note,
          }));

          project.impactMetrics.leedScorecard = recalculateLeedScorecard({
            ...scorecard,
            history: [...filteredHistory, ...newEntries],
          });
        }
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

        if (project.impactMetrics?.leedScorecard && milestone.leedPointContributions?.length) {
          const scorecard = project.impactMetrics.leedScorecard;
          project.impactMetrics.leedScorecard = recalculateLeedScorecard({
            ...scorecard,
            history: (scorecard.history || []).filter((entry) => entry.milestoneId !== milestone.id),
          });
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
