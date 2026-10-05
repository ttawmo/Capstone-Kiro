/**
 * Contract address + ABI the frontend talks to.
 *
 * After running the contract deploy script, copy
 *   contracts/deployments/localhost.json
 * into this file's `data` object (address + abi), or wire up an import.
 *
 * The address below is the deterministic first-deploy address on a fresh
 * Hardhat node, so for the standard demo flow it already matches. If you
 * redeploy differently, update it.
 */
const data = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  abi: [
    "function ISSUER_ROLE() view returns (bytes32)",
    "function CONTRACTOR_ROLE() view returns (bytes32)",
    "function PROJECT_OWNER_ROLE() view returns (bytes32)",
    "function grantRole(bytes32 role, address account)",
    "function hasRole(bytes32 role, address account) view returns (bool)",
    "function issueCredential(bytes32 credentialId, string credentialType, bytes32 holderRef, uint64 expiry, bytes32 docHash)",
    "function revokeCredential(bytes32 credentialId)",
    "function isCredentialValid(bytes32 credentialId) view returns (bool)",
    "function createActivity(bytes32 activityId, bytes32[] requiredCredentials)",
    "function checkEligibility(bytes32 activityId) view returns (bool eligible, bytes32 firstInvalid)",
    "function approveClearance(bytes32 activityId)",
    "function getCredential(bytes32 credentialId) view returns (string credentialType, bytes32 holderRef, address issuer, uint64 issuedAt, uint64 expiry, uint8 status, bytes32 docHash)",
    "function getActivity(bytes32 activityId) view returns (address contractor, bytes32[] requiredCredentials, bool approved)",
    "function verifyDocument(bytes32 credentialId, bytes32 candidateHash) view returns (bool)",
  ],
};

export default data;
