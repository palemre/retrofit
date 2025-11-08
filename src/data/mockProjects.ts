// src/data/mockProjects.ts

// Create a function to get/set projects so we can update them
let projectsData = {
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
    ]
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
    ]
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
    milestones: []
  }
};

// Export functions to get and update projects
export const getProjects = () => projectsData;
export const updateProjectInvestment = (projectId: number, investmentAmount: string) => {
  if (projectsData[projectId as keyof typeof projectsData]) {
    const currentRaised = parseFloat(projectsData[projectId].raisedAmount);
    const newInvestment = parseFloat(investmentAmount);
    projectsData[projectId].raisedAmount = (currentRaised + newInvestment).toFixed(2);
    
    const currentInvestors = parseInt(projectsData[projectId].investorCount);
    projectsData[projectId].investorCount = (currentInvestors + 1).toString();
  }
};