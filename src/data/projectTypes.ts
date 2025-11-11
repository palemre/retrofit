// src/data/projectTypes.ts

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
  investorAddress: string;
  timestamp: string;
}

export interface MilestoneReleaseTransaction {
  id: string;
  milestoneId: number;
  milestoneName: string;
  amount: string;
  timestamp: string;
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
  investmentHistory?: InvestmentTransaction[];
  milestoneReleaseHistory?: MilestoneReleaseTransaction[];
}
