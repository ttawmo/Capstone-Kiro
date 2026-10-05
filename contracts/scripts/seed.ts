import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Seeds the deployed contract into a known good demo state:
 *   - grants ISSUER / CONTRACTOR / PROJECT_OWNER roles to demo accounts
 *   - issues two valid credentials (crane inspection + operator licence)
 *   - creates one lifting activity requiring both
 *
 * After seeding, the activity is ELIGIBLE. The demo's dramatic moment is to
 * revoke one credential (from the frontend or console) and re-check -> NOT ELIGIBLE.
 *
 * Run after deploy, against the local node:
 *   npm run seed
 */

const id = (s: string) => ethers.id(s);

// Stable demo ids so the frontend can reference them.
export const DEMO = {
  craneCred: id("CRED-CRANE-INSPECTION-001"),
  operatorCred: id("CRED-OPERATOR-LICENCE-001"),
  activity: id("ACT-TOWER-LIFT-2026-001"),
  craneHolder: id("MACHINE-TOWER-CRANE-TC-01"),
  operatorHolder: id("WORKER-OPERATOR-W-77"),
  docHash: id("inspection-certificate-v1.pdf"),
};

async function main() {
  const deployment = JSON.parse(
    readFileSync(join(__dirname, "..", "deployments", "localhost.json"), "utf-8")
  );

  const [admin, issuer, , contractor, projectOwner] = await ethers.getSigners();
  const registry = await ethers.getContractAt("CredentialRegistry", deployment.address);

  // 1. roles (grantRole is idempotent — safe to run repeatedly)
  await (await registry.grantRole(await registry.ISSUER_ROLE(), issuer.address)).wait();
  await (await registry.grantRole(await registry.CONTRACTOR_ROLE(), contractor.address)).wait();
  await (
    await registry.grantRole(await registry.PROJECT_OWNER_ROLE(), projectOwner.address)
  ).wait();
  console.log("Granted roles. issuer=%s contractor=%s owner=%s", issuer.address, contractor.address, projectOwner.address);

  // 2. credentials (valid for 1 year).
  // The contract rejects re-issuing an existing credential id, so if a previous
  // run already issued these we skip issuance and just report state. This makes
  // the script safe to run against a freshly deployed contract OR an existing
  // one. For a full reset to the ELIGIBLE "before" state, deploy a fresh
  // contract first (npm run reset, or restart the node) — a revoked credential
  // cannot be un-revoked by design.
  const oneYear = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;

  // status 0 = never issued (enum None). Anything else means it exists.
  const craneStatus = (await registry.getCredential(DEMO.craneCred))[5];
  const craneExists = Number(craneStatus) !== 0;

  if (!craneExists) {
    await (
      await registry
        .connect(issuer)
        .issueCredential(DEMO.craneCred, "crane-inspection", DEMO.craneHolder, oneYear, DEMO.docHash)
    ).wait();
    await (
      await registry
        .connect(issuer)
        .issueCredential(DEMO.operatorCred, "operator-licence", DEMO.operatorHolder, oneYear, DEMO.docHash)
    ).wait();
    console.log("Issued crane-inspection and operator-licence credentials.");
  } else {
    console.log("Credentials already present on this contract — skipping issuance.");
  }

  // 3. activity requiring both (skip if it already exists)
  let activityExists = true;
  try {
    await registry.getActivity(DEMO.activity);
  } catch {
    activityExists = false;
  }
  if (!activityExists) {
    await (
      await registry
        .connect(contractor)
        .createActivity(DEMO.activity, [DEMO.craneCred, DEMO.operatorCred])
    ).wait();
    console.log("Created lifting activity.");
  } else {
    console.log("Activity already present — skipping creation.");
  }

  const [eligible] = await registry.checkEligibility(DEMO.activity);
  console.log("Eligible now:", eligible);
  if (!eligible) {
    console.log(
      "\nNOTE: a credential is revoked/expired on this contract. For a clean ELIGIBLE\n" +
        "state, run `npm run reset` (fresh node required) or restart the node then deploy+seed."
    );
  }
  console.log("\nDemo ids:");
  console.log(JSON.stringify(DEMO, null, 2));
  console.log("\nNext: revoke one credential and re-check eligibility to show NOT ELIGIBLE.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
