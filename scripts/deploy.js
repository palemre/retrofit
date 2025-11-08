// scripts/deploy.js
async function main() {
  console.log("Deploying RetroFit contract...");
  
  const RetroFit = await ethers.getContractFactory("RetroFit");
  const retrofit = await RetroFit.deploy();
  
  // For newer ethers versions, use getAddress()
  await retrofit.waitForDeployment();
  const address = await retrofit.getAddress();
  
  console.log("RetroFit contract deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });