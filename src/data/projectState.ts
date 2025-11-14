// src/data/projectState.ts

export interface LeedPointAward {
  category: string;
  points: number;
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
  leedPointContributions?: LeedPointAward[];
  leedHistoryId?: string | null;
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
}

export interface LeedScorecardMilestoneHistoryEntry {
  id: string;
  milestoneId: number;
  milestoneName: string;
  verifiedAt: string;
  awards: LeedPointAward[];
  totalPointsAwarded: number;
}

export interface LeedScorecard {
  certificationLevel: string;
  totalPoints: number;
  certificationDate?: string;
  reviewingOrganization?: string;
  scorecardStatus?: string;
  categories: LeedScoreCategory[];
  milestoneHistory?: LeedScorecardMilestoneHistoryEntry[];
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

const normalizeMilestones = (milestones: Milestone[] = []): Milestone[] =>
  milestones.map((milestone) => ({
    ...milestone,
    proofHash: milestone.proofHash || '',
    documents: milestone.documents || [],
    completedAt: milestone.completedAt ?? null,
    verifiedAt: milestone.verifiedAt ?? null,
    leedPointContributions: milestone.leedPointContributions || [],
    leedHistoryId: milestone.leedHistoryId ?? null,
  }));

const normalizeScorecard = (scorecard?: LeedScorecard | null): LeedScorecard | undefined => {
  if (!scorecard) {
    return scorecard ?? undefined;
  }

  const normalizedHistory = (scorecard.milestoneHistory || []).map((entry) => {
    const awards = (entry.awards || []).map((award) => ({ ...award }));
    const totalPointsAwarded =
      entry.totalPointsAwarded !== undefined
        ? entry.totalPointsAwarded
        : awards.reduce((sum, award) => sum + (award.points || 0), 0);

    return {
      ...entry,
      awards,
      totalPointsAwarded,
    };
  });

  return {
    ...scorecard,
    categories: (scorecard.categories || []).map((category) => ({ ...category })),
    milestoneHistory: normalizedHistory,
  };
};

const withProjectDefaults = (project: Project): Project => ({
  ...project,
  projectWalletBalance: project.projectWalletBalance || '0',
  milestones: normalizeMilestones(project.milestones || []),
  impactMetrics: project.impactMetrics
    ? {
        ...project.impactMetrics,
        leedScorecard: normalizeScorecard(project.impactMetrics.leedScorecard),
      }
    : project.impactMetrics,
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
        documents: [],
        leedPointContributions: [
          { category: "Energy & Atmosphere", points: 4 },
          { category: "Innovation", points: 1 },
        ],
        leedHistoryId: null
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
          { category: "Energy & Atmosphere", points: 3 },
          { category: "Indoor Environmental Quality", points: 2 },
        ],
        leedHistoryId: null
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
        milestoneHistory: [],
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
          { category: "Energy & Atmosphere", points: 5 },
          { category: "Indoor Environmental Quality", points: 2 },
        ],
        leedHistoryId: null
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
          { category: "Energy & Atmosphere", points: 3 },
          { category: "Water Efficiency", points: 2 },
        ],
        leedHistoryId: null
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
        milestoneHistory: [],
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
        milestoneHistory: [],
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
          const initialImpactMetrics = initialProject.impactMetrics;
          const savedImpactMetrics = savedProject.impactMetrics;
          const mergedImpactMetrics = initialImpactMetrics || savedImpactMetrics
            ? {
                ...(initialImpactMetrics || {}),
                ...(savedImpactMetrics || {}),
                leedScorecard: normalizeScorecard(
                  savedImpactMetrics?.leedScorecard || initialImpactMetrics?.leedScorecard
                ),
              }
            : undefined;

          acc[numericKey] = withProjectDefaults({
            ...initialProject,
            ...savedProject,
            milestones: normalizeMilestones(savedProject.milestones || initialProject.milestones),
            impactMetrics: (mergedImpactMetrics || initialImpactMetrics || savedImpactMetrics) as ImpactMetrics,
            investmentHistory: savedProject.investmentHistory || initialProject.investmentHistory || [],
            milestonePayoutHistory: savedProject.milestonePayoutHistory || initialProject.milestonePayoutHistory || [],
          });
        } else {
          const fallbackProject = savedProject || initialProject;
          if (fallbackProject) {
            const fallbackImpactMetrics = fallbackProject.impactMetrics;
            const initialImpactMetrics = initialProject?.impactMetrics;
            const mergedFallbackImpact = fallbackImpactMetrics || initialImpactMetrics
              ? {
                  ...(initialImpactMetrics || {}),
                  ...(fallbackImpactMetrics || {}),
                  leedScorecard: normalizeScorecard(
                    fallbackImpactMetrics?.leedScorecard || initialImpactMetrics?.leedScorecard
                  ),
                }
              : undefined;

            acc[numericKey] = withProjectDefaults({
              ...fallbackProject,
              milestones: normalizeMilestones(fallbackProject.milestones),
              impactMetrics: (mergedFallbackImpact || fallbackImpactMetrics || initialImpactMetrics) as ImpactMetrics,
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
      const placeholderDocumentName = `Milestone_${milestone.id}_Proof_of_Work.pdf`;
      const existingDocuments = Array.isArray(milestone.documents) ? milestone.documents : [];
      const ensurePlaceholderDocument = (documents: string[]): string[] => {
        const docSet = new Set(documents);
        docSet.add(placeholderDocumentName);
        return Array.from(docSet);
      };
      const generateProofHash = () => {
        let hash = '0x';
        for (let i = 0; i < 64; i += 1) {
          hash += Math.floor(Math.random() * 16).toString(16);
        }
        return hash;
      };

      if (updates.completed !== undefined) {
        if (updates.completed && !wasCompleted) {
          updatesWithTimestamps.completedAt = new Date().toISOString();
          updatesWithTimestamps.documents = ensurePlaceholderDocument(existingDocuments);
        } else if (!updates.completed && wasCompleted) {
          updatesWithTimestamps.completedAt = null;
          updatesWithTimestamps.documents = [];
          updatesWithTimestamps.proofHash = '';
        }
      }

      if (updates.verified !== undefined) {
        if (updates.verified && !wasVerified) {
          updatesWithTimestamps.verifiedAt = new Date().toISOString();
          const documentsToPersist = updatesWithTimestamps.documents ?? existingDocuments;
          updatesWithTimestamps.documents = ensurePlaceholderDocument(documentsToPersist);
          const currentHash = milestone.proofHash && milestone.proofHash.trim().length > 0 ? milestone.proofHash : '';
          updatesWithTimestamps.proofHash = currentHash || generateProofHash();
        } else if (!updates.verified && wasVerified) {
          updatesWithTimestamps.verifiedAt = null;
          updatesWithTimestamps.proofHash = '';
        }
      }

      Object.assign(milestone, updatesWithTimestamps);

      const scorecard = project.impactMetrics?.leedScorecard;
      const contributions = milestone.leedPointContributions || [];
      if (scorecard && !scorecard.milestoneHistory) {
        scorecard.milestoneHistory = [];
      }

      if (scorecard && contributions.length > 0) {
        if (!wasVerified && milestone.verified) {
          const awards: LeedPointAward[] = [];

          contributions.forEach(({ category, points }) => {
            if (!category) return;
            const targetCategory = scorecard.categories.find((entry) => entry.category === category);
            const safePoints = Number.isFinite(points) ? points : 0;

            if (targetCategory) {
              const before = Number.isFinite(targetCategory.achievedPoints)
                ? targetCategory.achievedPoints
                : 0;
              const cap = Number.isFinite(targetCategory.availablePoints) ? targetCategory.availablePoints : 0;
              const possibleGain = Math.max(0, Math.min(safePoints, cap - before));
              if (possibleGain > 0) {
                targetCategory.achievedPoints = before + possibleGain;
                awards.push({ category, points: possibleGain });
              }
            } else if (safePoints > 0) {
              scorecard.categories.push({
                category,
                achievedPoints: safePoints,
                availablePoints: safePoints,
                notes: 'Added via milestone verification',
              });
              awards.push({ category, points: safePoints });
            }
          });

          const totalAwarded = awards.reduce((sum, award) => sum + award.points, 0);
          if (totalAwarded > 0) {
            scorecard.totalPoints = Math.max(0, (scorecard.totalPoints || 0) + totalAwarded);
          }

          const historyEntry: LeedScorecardMilestoneHistoryEntry = {
            id: `${milestone.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            verifiedAt: milestone.verifiedAt || new Date().toISOString(),
            awards,
            totalPointsAwarded: totalAwarded,
          };

          scorecard.milestoneHistory = [...scorecard.milestoneHistory, historyEntry];
          milestone.leedHistoryId = historyEntry.id;
        } else if (wasVerified && !milestone.verified) {
          const historyId = milestone.leedHistoryId;
          let entryToRemoveIndex = -1;

          if (historyId) {
            entryToRemoveIndex = scorecard.milestoneHistory?.findIndex((entry) => entry.id === historyId) ?? -1;
          }

          if (entryToRemoveIndex === -1 && scorecard.milestoneHistory) {
            for (let i = scorecard.milestoneHistory.length - 1; i >= 0; i -= 1) {
              if (scorecard.milestoneHistory[i].milestoneId === milestone.id) {
                entryToRemoveIndex = i;
                break;
              }
            }
          }

          if (entryToRemoveIndex >= 0 && scorecard.milestoneHistory) {
            const [removedEntry] = scorecard.milestoneHistory.splice(entryToRemoveIndex, 1);

            removedEntry.awards.forEach(({ category, points }) => {
              if (points <= 0) return;
              const targetCategory = scorecard.categories.find((entry) => entry.category === category);
              if (targetCategory) {
                const before = Number.isFinite(targetCategory.achievedPoints)
                  ? targetCategory.achievedPoints
                  : 0;
                targetCategory.achievedPoints = Math.max(0, before - points);
              }
            });

            if (removedEntry.totalPointsAwarded > 0) {
              scorecard.totalPoints = Math.max(
                0,
                (scorecard.totalPoints || 0) - removedEntry.totalPointsAwarded
              );
            }
          }

          milestone.leedHistoryId = null;
        }
      }

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
