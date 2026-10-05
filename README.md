# Shared Construction Credential Network

A **proof-of-concept** blockchain credential layer for high-risk construction
operations (crane lifting). Trusted issuers record portable worker and equipment
credentials on-chain; existing e-PTW systems (e.g. Hubble) query that layer to
confirm the required credentials are valid before a lifting activity proceeds.

The blockchain sits **underneath** existing e-PTW systems — it does not replace
them. This is a proof-of-concept, not a production industry blockchain.

## The core workflow (what this proves)

1. A trusted issuer issues a credential (worker or equipment).
2. The credential is recorded on-chain (reference, issuer, expiry, status, hash).
3. A contractor creates a lifting activity and assigns workers/equipment.
4. A smart contract checks every required credential is valid, non-revoked, and
   from an approved issuer → **ELIGIBLE**.
5. Revoking one credential makes the same check return **NOT ELIGIBLE**.

Step 5 is the centerpiece of the demo.

## Architecture

```
MOM / Training Providers / Authorised Examiners
        │  issue / update credentials
        ▼
  Shared Blockchain Credential Layer   (on-chain: refs, issuer, expiry, status, hash)
        │  verify credentials
        ▼
  e-PTW system (Hubble / other)        (site-specific checks stay here)
        │  project-specific PTW checks
        ▼
      PTW approval → activity cleared
```

On-chain stores only references, issuer, holder/asset ID, expiry, status,
revocation, and the SHA-256 document hash. PDFs, personal data, and application
data live off-chain in Supabase. See `.kiro/steering/tech.md` for the strict rule.

## Repository layout

| Path | Purpose |
| --- | --- |
| `contracts/` | Solidity + Hardhat smart contracts and tests |
| `web/` | React + TypeScript + Vite + Tailwind frontend |
| `db/` | Supabase/PostgreSQL schema |
| `docs/adr/` | Architecture Decision Records |
| `.kiro/steering/` | Shared project context (product, tech, structure, conventions) |

## Tech stack

React + TypeScript + Vite + Tailwind · Solidity + Hardhat + OpenZeppelin +
ethers.js (local Ethereum network) · Supabase / PostgreSQL + Supabase Storage ·
SHA-256 for document integrity.

## Getting started

> Scaffolding is in place; application code is generated from the Kiro spec.
> Setup steps will be completed as each package is initialised.

```bash
# 1. Copy environment template
cp .env.example .env   # then fill in values

# 2. Contracts (once initialised)
cd contracts && npm install && npx hardhat test

# 3. Frontend (once initialised)
cd web && npm install && npm run dev
```

## Scope boundaries

Explicitly **not** built (proof-of-concept, 15-day part-time): real MOM/LTA/BCA/
Hubble API integration, government credential verification, NRIC/personal data,
mobile app, tokens/NFTs/payments, AI, IoT, a full PTW or WSH management system.

Site-specific checks (lifting plan, crane position, ground condition, weather,
risk assessment, toolbox briefing, physical inspection, final PTW approval) stay
in the e-PTW system and are out of scope for the blockchain layer.
