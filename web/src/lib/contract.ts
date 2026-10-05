import { BrowserProvider, Contract, JsonRpcProvider, ethers } from "ethers";
import deployment from "./deployment";

/**
 * Thin ethers.js client for the CredentialRegistry contract.
 *
 * The MVP talks to the local Hardhat node. For a read-only connection it uses a
 * JsonRpcProvider; for transactions it uses whichever signer you pass in. To
 * keep the MVP demo simple and wallet-free, we connect using one of the local
 * node's known private keys (see getLocalSigner). A real build would use
 * MetaMask via BrowserProvider instead — the hook already supports that path.
 */

export const RPC_URL = "http://127.0.0.1:8545";

// keccak256("...") must match the Solidity role constants.
export const ROLES = {
  ISSUER: ethers.id("ISSUER_ROLE"),
  CONTRACTOR: ethers.id("CONTRACTOR_ROLE"),
  PROJECT_OWNER: ethers.id("PROJECT_OWNER_ROLE"),
};

// Default Hardhat node accounts (publicly known, local only — never real funds).
export const LOCAL_KEYS = {
  admin: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  issuer: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  contractor: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  projectOwner: "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
};

export function readProvider() {
  return new JsonRpcProvider(RPC_URL);
}

export function getLocalSigner(key: keyof typeof LOCAL_KEYS) {
  return new ethers.Wallet(LOCAL_KEYS[key], readProvider());
}

export function getContract(runner: ethers.ContractRunner) {
  return new Contract(deployment.address, deployment.abi, runner);
}

// Convenience: a read-only contract instance.
export function getReadContract() {
  return getContract(readProvider());
}

// Optional MetaMask path for a future, wallet-based build.
export async function getBrowserContract() {
  const anyWindow = window as unknown as { ethereum?: ethers.Eip1193Provider };
  if (!anyWindow.ethereum) throw new Error("No injected wallet found");
  const provider = new BrowserProvider(anyWindow.ethereum);
  const signer = await provider.getSigner();
  return getContract(signer);
}

export const id = (s: string) => ethers.id(s);
