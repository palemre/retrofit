// src/data/projectState.ts

export interface Milestone {
  id: number;
  name: string;
  description: string;
  amount: string;
  completed: boolean;
  verified: boolean;
  proofHash: string;
  documents: string[];
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
}

type ProjectDictionary = Record<number, Project>;

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
    milestones: [
      {
        id: 1,
        name: "Solar Panel Installation",
        description: "Install 100kW solar array on rooftop",
        amount: "25",
        completed: false,
        verified: false,
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
        proofHash: "",
        documents: []
      }
    ],
    impactMetrics: {
      annualCO2Reduction: 128,
      energySavings: 32,
      jobsCreated: 18,
      leedCertification: "LEED Gold"
    }
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
    milestones: [
      {
        id: 1,
        name: "HVAC Replacement",
        description: "Install high-efficiency heating and cooling systems",
        amount: "45",
        completed: false,
        verified: false,
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
        proofHash: "",
        documents: []
      }
    ],
    impactMetrics: {
      annualCO2Reduction: 94,
      energySavings: 27,
      jobsCreated: 22,
      leedCertification: "LEED Silver"
    }
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
    milestones: [],
    impactMetrics: {
      annualCO2Reduction: 142,
      energySavings: 35,
      jobsCreated: 15,
      leedCertification: "LEED Platinum Pending"
    }
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
          acc[numericKey] = {
            ...initialProject,
            ...savedProject,
            milestones: savedProject.milestones || initialProject.milestones,
            impactMetrics: savedProject.impactMetrics || initialProject.impactMetrics,
          };
          if (!acc[numericKey].projectWalletBalance) {
            acc[numericKey].projectWalletBalance = '0';
          }
        } else {
          const fallbackProject = savedProject || initialProject;
          if (fallbackProject) {
            acc[numericKey] = {
              ...fallbackProject,
              projectWalletBalance: fallbackProject.projectWalletBalance || '0',
            };
          }
        }
        return acc;
      }, {} as ProjectDictionary);

      return mergedEntries;
    }
  }
  return initialProjects;
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
  investmentAmount: string
): Project | null => {
  const projects = loadProjects();
  if (projects[projectId]) {
    const currentRaised = parseFloat(projects[projectId].raisedAmount);
    const newInvestment = parseFloat(investmentAmount);
    projects[projectId].raisedAmount = (currentRaised + newInvestment).toFixed(2);

    const currentInvestors = parseInt(projects[projectId].investorCount);
    projects[projectId].investorCount = (currentInvestors + 1).toString();

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

      Object.assign(milestone, updates);

      if (!wasVerified && milestone.verified) {
        const currentBalance = parseFloat(project.projectWalletBalance || '0');
        const milestoneAmount = parseFloat(milestone.amount || '0');
        const updatedBalance = currentBalance + (isNaN(milestoneAmount) ? 0 : milestoneAmount);
        project.projectWalletBalance = updatedBalance.toFixed(2);
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
