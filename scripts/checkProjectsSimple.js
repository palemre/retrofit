// scripts/checkProjectsSimple.js
async function main() {
  console.log("Checking contract projects...");
  
  const RetroFit = await ethers.getContractFactory("RetroFit");
  const retrofit = await RetroFit.attach("0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9");

  try {
    const counter = await retrofit.projectCounter();
    console.log("Project counter:", counter.toString());
    
    if (counter > 0) {
      console.log("\nProjects found:");
      for (let i = 1; i <= counter; i++) {
        const project = await retrofit.projects(i);
        console.log(`Project ${i}:`, project.name);
      }
    } else {
      console.log("No projects found in contract!");
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });