// scripts/initProjects.js
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Initializing projects with account:", deployer.address);

  const RetroFit = await ethers.getContractFactory("RetroFit");
  const retrofit = await RetroFit.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");

  // Create first project
  console.log("Creating project 1...");
  const tx1 = await retrofit.createProject(
    "Downtown Office Retrofit",
    "Solar panel installation and window upgrades for commercial building",
    ethers.parseEther("50"), // 50 ETH target
    850, // 8.5% return in basis points
    720 // 24 months in days (720 days)
  );
  await tx1.wait();
  console.log("Project 1 created!");

  // Create second project  
  console.log("Creating project 2...");
  const tx2 = await retrofit.createProject(
    "Apartment Complex Green Upgrade", 
    "HVAC system replacement and insulation for residential building",
    ethers.parseEther("75"), // 75 ETH target
    720, // 7.2% return
    540 // 18 months
  );
  await tx2.wait();
  console.log("Project 2 created!");

  console.log("Projects initialized successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });