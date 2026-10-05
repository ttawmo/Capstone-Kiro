import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { CredentialRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * The six acceptance tests are the project's proof (see .kiro/steering).
 * They must stay green:
 *   1. valid credential            -> pass
 *   2. expired credential          -> fail
 *   3. revoked credential          -> fail
 *   4. wrong issuer                -> fail (cannot revoke someone else's)
 *   5. all credentials valid       -> ELIGIBLE
 *   6. one credential invalid      -> NOT ELIGIBLE
 */

const id = (s: string) => ethers.id(s); // keccak256 of a string -> bytes32
const DOC_HASH = ethers.id("certificate-pdf-contents");
const ZERO = ethers.ZeroHash;

describe("CredentialRegistry", () => {
  let registry: CredentialRegistry;
  let admin: HardhatEthersSigner;
  let issuer: HardhatEthersSigner;
  let otherIssuer: HardhatEthersSigner;
  let contractor: HardhatEthersSigner;
  let projectOwner: HardhatEthersSigner;

  const CRED = id("CRED-CRANE-001");
  const ACTIVITY = id("ACT-LIFT-001");
  const HOLDER = id("MACHINE-CRANE-7");

  beforeEach(async () => {
    [admin, issuer, otherIssuer, contractor, projectOwner] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("CredentialRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();

    // Grant roles from the admin (deployer).
    await registry.grantRole(await registry.ISSUER_ROLE(), issuer.address);
    await registry.grantRole(await registry.ISSUER_ROLE(), otherIssuer.address);
    await registry.grantRole(await registry.CONTRACTOR_ROLE(), contractor.address);
    await registry.grantRole(await registry.PROJECT_OWNER_ROLE(), projectOwner.address);
  });

  // helper: issue a credential as `issuer` with an expiry some seconds ahead
  async function issueValid(credId: string, secondsAhead = 3600) {
    const now = await time.latest();
    await registry
      .connect(issuer)
      .issueCredential(credId, "crane-inspection", HOLDER, now + secondsAhead, DOC_HASH);
  }

  // ---- 1. valid credential -> pass ----
  it("1. treats a freshly issued, unexpired credential as valid", async () => {
    await issueValid(CRED);
    expect(await registry.isCredentialValid(CRED)).to.equal(true);
  });

  // ---- 2. expired credential -> fail ----
  it("2. treats an expired credential as invalid", async () => {
    const now = await time.latest();
    await registry
      .connect(issuer)
      .issueCredential(CRED, "crane-inspection", HOLDER, now + 100, DOC_HASH);

    await time.increase(200); // move past expiry
    expect(await registry.isCredentialValid(CRED)).to.equal(false);
  });

  // ---- 3. revoked credential -> fail ----
  it("3. treats a revoked credential as invalid", async () => {
    await issueValid(CRED);
    expect(await registry.isCredentialValid(CRED)).to.equal(true);

    await registry.connect(issuer).revokeCredential(CRED);
    expect(await registry.isCredentialValid(CRED)).to.equal(false);
  });

  // ---- 4. wrong issuer -> fail ----
  it("4. prevents an issuer from revoking a credential they did not issue", async () => {
    await issueValid(CRED);

    await expect(
      registry.connect(otherIssuer).revokeCredential(CRED)
    ).to.be.revertedWith("only issuing issuer may revoke");

    // and a non-issuer is blocked by role
    await expect(registry.connect(contractor).revokeCredential(CRED)).to.be.reverted;
  });

  // ---- 5. all credentials valid -> ELIGIBLE ----
  it("5. reports an activity ELIGIBLE when every required credential is valid", async () => {
    const credA = id("CRED-A");
    const credB = id("CRED-B");
    await issueValid(credA);
    await issueValid(credB);

    await registry.connect(contractor).createActivity(ACTIVITY, [credA, credB]);

    const [eligible, firstInvalid] = await registry.checkEligibility(ACTIVITY);
    expect(eligible).to.equal(true);
    expect(firstInvalid).to.equal(ZERO);

    // project owner can record clearance
    await expect(registry.connect(projectOwner).approveClearance(ACTIVITY)).to.not.be.reverted;
  });

  // ---- 6. one credential invalid -> NOT ELIGIBLE (the demo centerpiece) ----
  it("6. reports NOT ELIGIBLE after one credential is revoked", async () => {
    const credA = id("CRED-A");
    const credB = id("CRED-B");
    await issueValid(credA);
    await issueValid(credB);
    await registry.connect(contractor).createActivity(ACTIVITY, [credA, credB]);

    // initially eligible
    let [eligible] = await registry.checkEligibility(ACTIVITY);
    expect(eligible).to.equal(true);

    // revoke one -> the same check now fails, naming the offending credential
    await registry.connect(issuer).revokeCredential(credA);

    const [eligibleAfter, firstInvalid] = await registry.checkEligibility(ACTIVITY);
    expect(eligibleAfter).to.equal(false);
    expect(firstInvalid).to.equal(credA);

    // and clearance can no longer be approved
    await expect(
      registry.connect(projectOwner).approveClearance(ACTIVITY)
    ).to.be.revertedWith("activity not eligible");
  });

  // ---- extra: document tamper detection ----
  it("detects a tampered document via hash mismatch", async () => {
    await issueValid(CRED);
    expect(await registry.verifyDocument(CRED, DOC_HASH)).to.equal(true);
    expect(await registry.verifyDocument(CRED, ethers.id("altered-pdf"))).to.equal(false);
  });
});
