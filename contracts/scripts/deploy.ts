import { ethers, artifacts } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Deploys CredentialRegistry and writes the address + ABI to
 * contracts/deployments/localhost.json so the frontend and seed script
 * can pick them up. Run against a running local node:
 *   npx hardhat node          (in one terminal)
 *   npm run deploy            (in another)
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Factory = await ethers.getContractFactory("CredentialRegistry");
  const registry = await Factory.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("CredentialRegistry deployed at:", address);

  const artifact = await artifacts.readArtifact("CredentialRegistry");
  const outDir = join(__dirname, "..", "deployments");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, "localhost.json"),
    JSON.stringify({ address, abi: artifact.abi }, null, 2)
  );
  console.log("Wrote deployments/localhost.json");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
