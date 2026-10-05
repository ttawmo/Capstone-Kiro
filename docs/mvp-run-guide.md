# MVP Run Guide

This repo ships a **working MVP** of the core workflow:

> issue credential → record on-chain → create lifting activity → check eligibility
> → **ELIGIBLE** → revoke one credential → **NOT ELIGIBLE**

It is a foundation the team builds up from — not the finished product. The smart
contract, its six acceptance tests, deploy/seed scripts, and a minimal web UI all
run locally today.

## What's included

| Part | Location | Status |
| --- | --- | --- |
| Smart contract | `contracts/contracts/CredentialRegistry.sol` | working, 7 tests green |
| Acceptance tests | `contracts/test/CredentialRegistry.test.ts` | the 6 cases + tamper check |
| Deploy script | `contracts/scripts/deploy.ts` | writes address+ABI |
| Seed script | `contracts/scripts/seed.ts` | known-good demo state |
| Web UI | `web/` | Vite + React + ethers.js |

## Prerequisites

- Node.js 18+ and npm.
- Three terminals (node, then deploy/seed, then web).

## Run it

### 1. Contracts — install and test

```bash
cd contracts
npm install
npm test          # expect 7 passing
```

### 2. Start the local blockchain (terminal A, leave running)

```bash
cd contracts
HARDHAT_DISABLE_TELEMETRY_PROMPT=true npm run node
```

### 3. Deploy and seed (terminal B)

```bash
cd contracts
npm run deploy    # deploys to 0x5FbDB2315678afecb367f032d93F642f64180aa3 on a fresh node
npm run seed      # issues 2 credentials + 1 activity -> ELIGIBLE
```

The first deploy on a fresh node is deterministic, so the address matches the one
the frontend expects (`web/src/lib/deployment.ts`). If you redeploy to a different
address, update that file.

### 4. Web UI (terminal C)

```bash
cd web
npm install
npm run dev       # http://localhost:5173
```

## The demo (follow docs/demo-script.md)

1. The UI loads showing the activity as **ELIGIBLE** and both credentials **VALID**.
2. Click **Revoke crane inspection** (issuer action).
3. The activity flips to **NOT ELIGIBLE**, naming the blocking credential.
4. Clearance approval is now rejected.

Reset to the eligible state anytime:

```bash
cd contracts && npm run seed
```

> If you revoked and want a fully clean slate, restart the node (terminal A),
> then `npm run deploy && npm run seed` again.

## How the layers connect

- **On-chain** (contract): credential refs, issuer, expiry, status, revocation,
  document hash. The eligibility logic lives here.
- **Off-chain** (planned, `db/schema.sql`): PDFs, worker/machine metadata,
  activities detail, personal data (placeholders only). Not wired into the MVP
  yet — this is a natural next build-up step.

## Where to build up from here

- Wire the UI to Supabase for off-chain metadata and document upload/hashing
  (schema already in `db/schema.sql`).
- Add issuer/contractor dashboards for creating credentials and activities from
  the UI (the MVP seeds these via script).
- Swap the local known-key signing for MetaMask (`getBrowserContract()` in
  `web/src/lib/contract.ts` already stubs this path).
- Add the document tamper-detection screen (contract `verifyDocument` exists).

## Notes

- The frontend signs transactions with the local Hardhat node's publicly-known
  development keys for a wallet-free demo. These are local-only and must never be
  used on a real network.
- See `docs/adr/` for the key architecture decisions and
  `.kiro/steering/` for the full product/tech/scope rules.
