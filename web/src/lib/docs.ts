import { getContract, getLocalSigner, getReadContract, id } from "./contract";

/**
 * Document hashing + on-chain tamper verification.
 *
 * The contract stores a bytes32 `docHash` per credential and exposes
 * verifyDocument(credentialId, candidateHash) as a plain equality check. SHA-256
 * produces exactly 32 bytes, so it maps directly onto bytes32.
 *
 * Honest note: the seeded demo credential's docHash is a placeholder
 * (keccak256 of a label string), not the SHA-256 of a real file — there is no
 * real PDF behind it. So to demonstrate genuine tamper detection we:
 *   1. compute the real SHA-256 of an uploaded file in the browser,
 *   2. register it on-chain by issuing a fresh credential with that hash,
 *   3. verify the same file -> INTACT, or a modified file -> ALTERED.
 */

/** SHA-256 of a file's bytes, formatted as a 0x-prefixed 32-byte hex string. */
export async function sha256Bytes32(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  const bytes = new Uint8Array(digest);
  let hex = "0x";
  for (const b of bytes) hex += b.toString(16).padStart(2, "0");
  return hex; // 0x + 64 hex chars = bytes32
}

/**
 * Register a document hash on-chain by issuing a new credential whose docHash is
 * the file's SHA-256. Returns the on-chain credential id used.
 */
export async function registerDocument(fileHash: string): Promise<string> {
  const issuer = getContract(getLocalSigner("issuer"));
  // unique id per registration so repeated demos don't hit "already issued"
  const credentialId = id("DOC-REG-" + Date.now());
  const holderRef = id("DEMO-DOC-HOLDER");
  const noExpiry = 0;
  const tx = await issuer.issueCredential(
    credentialId,
    "document-registration",
    holderRef,
    noExpiry,
    fileHash
  );
  await tx.wait();
  return credentialId;
}

/** Verify a candidate hash against a credential's stored docHash (on-chain). */
export async function verifyDocument(credentialId: string, candidateHash: string): Promise<boolean> {
  const c = getReadContract();
  return c.verifyDocument(credentialId, candidateHash);
}
