// src/data/mockProjects.ts

import { Project } from './projectState';

// Create a function to get/set projects so we can update them
let projectsData: Record<number, Project> = {
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
    ],
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
    milestones: [
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
    ],
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
    milestones: [],
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

// Export functions to get and update projects
export const getProjects = () => projectsData;
export const updateProjectInvestment = (projectId: number, investmentAmount: string, investorWallet: string) => {
  if (projectsData[projectId as keyof typeof projectsData]) {
    const currentRaised = parseFloat(projectsData[projectId].raisedAmount);
    const newInvestment = parseFloat(investmentAmount);
    projectsData[projectId].raisedAmount = (currentRaised + newInvestment).toFixed(2);

    const currentInvestors = parseInt(projectsData[projectId].investorCount);
    projectsData[projectId].investorCount = (currentInvestors + 1).toString();

    projectsData[projectId].investmentHistory = [
      ...(projectsData[projectId].investmentHistory || []),
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        amount: investmentAmount,
        date: new Date().toISOString(),
        investorWallet,
      },
    ];
  }
};