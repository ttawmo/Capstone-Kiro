# Project Report — Shared Construction Credential Network

> **Living document.** This is the single source of truth for the project's
> features, scope, tech stack, and status. **Whenever the project changes
> (features added/removed, stack changed, scope adjusted), update this file in
> the same commit.** See "Maintenance" at the bottom.

- **Last updated:** 2026-10-05
- **Status:** Working MVP (core workflow proven end-to-end)
- **Repository:** https://github.com/ttawmo/Capstone-Kiro

---

## 1. Summary

A **proof-of-concept blockchain credential layer** for high-risk construction
(crane lifting). Trusted issuers record portable worker and equipment credentials
on-chain. The system checks that every required credential is valid before a
lifting activity is cleared. The blockchain sits **underneath** existing e-PTW
systems (e.g. Hubble); it does not replace them.

This is a proof-of-concept, not a production industry blockchain.

---

## 2. Core workflow (what the MVP proves)

1. A trusted issuer issues a credential (worker or equipment).
2. The credential is recorded on-chain (reference, issuer, expiry, status, hash).
3. A contractor creates a lifting activity and assigns the required credentials.
4. A smart contract checks all are valid, non-revoked, approved issuer → **ELIGIBLE**.
5. Revoking one credential makes the same check return **NOT ELIGIBLE**.

Step 5 is the demonstration centerpiece.

---

## 3. Tech stack (actual installed versions)

| Layer | Technology | Version |
| --- | --- | --- |
| Contract language | Solidity | 0.8.24 |
| Contract tooling | Hardhat | 2.29.1 |
| Contract libraries | OpenZeppelin Contracts | 5.6.1 |
| Blockchain interaction | ethers.js | 6.17.0 |
| Local blockchain | Hardhat Network (local Ethereum) | (bundled) |
| Frontend framework | React | 18.3.1 |
| Language | TypeScript | 5.9.3 |
| Build tool / dev server | Vite | 5.4.21 |
| Styling | Plain CSS (Tailwind deferred — ADR 0003) | — |
| Runtime | Node.js | 24.21.0 |
| Off-chain DB (planned) | Supabase / PostgreSQL | not wired in yet |
| Version control | Git / GitHub | — |

---

## 4. Features

### Implemented (working in the MVP)

| # | Feature | Where | Status |
| --- | --- | --- | --- |
| F1 | Role-based access (issuer / contractor / project owner) | `CredentialRegistry.sol` (OpenZeppelin AccessControl) | Done |
| F2 | Issue credential (worker or equipment) | `issueCredential()` | Done |
| F3 | Revoke credential (only issuing issuer) | `revokeCredential()` | Done |
| F4 | Validity check (issued, not revoked, not expired) | `isCredentialValid()` | Done |
| F5 | Create lifting activity with required credentials | `createActivity()` | Done |
| F6 | Eligibility check (all required valid) + first failing id | `checkEligibility()` | Done |
| F7 | Clearance approval (only if eligible) | `approveClearance()` | Done |
| F8 | Document tamper detection via SHA-256 hash | `verifyDocument()` | Done |
| F9 | Six acceptance tests + tamper test (7 total) | `contracts/test/` | 7 passing |
| F10 | Deploy script (writes address + ABI) | `contracts/scripts/deploy.ts` | Done |
| F11 | Demo seed script (known-good eligible state) | `contracts/scripts/seed.ts` | Done |
| F12 | Web UI: eligibility, credential status, revoke, approve, log | `web/src/App.tsx` | Done |

### Planned / build-up (not yet implemented)

| # | Feature | Notes |
| --- | --- | --- |
| P1 | Supabase off-chain store (metadata, activities, documents) | schema ready in `db/schema.sql` |
| P2 | Document upload + hashing from the UI | contract side (`verifyDocument`) exists |
| P3 | Issuer/contractor dashboards to create data from the UI | MVP seeds via script instead |
| P4 | MetaMask wallet signing | stub in `getBrowserContract()` |
| P5 | Tamper-detection screen in the UI | contract support exists |
| P6 | Tailwind styling | currently plain CSS (ADR 0003) |

---

## 5. Scope boundaries (explicitly NOT built)

Out of scope for this 15-day part-time proof-of-concept:

- Real MOM / LTA / BCA / Hubble API integration
- Real government credential verification
- NRIC or any real personal data (placeholders only)
- Mobile app
- Tokens, NFTs, cryptocurrency, payments
- AI, IoT
- A full PTW system or full WSH management system
- More than ~15 UI screens or more than ~6 core contract functions

Site-specific checks (lifting plan, crane position, ground condition, weather,
risk assessment, toolbox briefing, physical inspection, final PTW approval) stay
in the e-PTW system and are out of scope for the blockchain layer.

---

## 6. Architecture

```
Issuers (MOM / Authorised Examiners / training providers)
   │  issue / revoke credentials
   ▼
CredentialRegistry (on-chain)      on-chain: ref, issuer, expiry, status, hash
   │  eligibility logic
   ▼
e-PTW system (Hubble / other)      site-specific checks stay here (out of scope)
   │
   ▼
PTW approval → lift cleared
```

- **On-chain:** credential refs, issuer, holder/asset id, expiry, status,
  revocation, SHA-256 document hash. Eligibility logic lives here.
- **Off-chain (planned):** PDFs, worker/machine metadata, activities, personal
  data (placeholders only). See `db/schema.sql`.

Key decisions are recorded as ADRs in `docs/adr/`:
- ADR 0001 — local Ethereum network over Hyperledger Fabric
- ADR 0002 — hashes on-chain, PDFs/personal data off-chain
- ADR 0003 — plain CSS for the MVP, Tailwind deferred

---

## 7. Repository layout

| Path | Purpose |
| --- | --- |
| `contracts/` | Solidity contract, tests, deploy/seed scripts |
| `web/` | React + Vite + ethers.js frontend |
| `db/schema.sql` | Off-chain schema (planned integration) |
| `docs/` | This report, run guide, demo script, presentation, ADRs |
| `.kiro/steering/` | Shared project rules (product, tech, structure, conventions) |
| `.kiro/hooks/` | Automation (test gates, report-update reminder) |

---

## 8. How to run

See `docs/mvp-run-guide.md` for full steps. Short version (deps already installed):

```bash
# terminal A — local blockchain
cd contracts && HARDHAT_DISABLE_TELEMETRY_PROMPT=true npm run node
# terminal B — deploy + seed
cd contracts && npm run deploy && npm run seed
# terminal C — web app
cd web && npm run dev      # http://localhost:5173
```

Demo: activity shows ELIGIBLE → click "Revoke crane inspection" → NOT ELIGIBLE.
Reset: restart node, then `npm run deploy && npm run seed`.

---

## 9. Change log

Record every meaningful change here (newest first): date, what changed, why.

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-05 | Initial MVP: contract + 7 tests, deploy/seed scripts, web UI, docs. Report created. | — |

---

## 10. Maintenance — keep this document current

**Rule:** when you change the project, update this report in the **same commit**.

Update this file when you:
- add, remove, or change a **feature** → update §4 (move items between
  implemented/planned) and add a §9 change-log row
- change the **tech stack** or a major dependency version → update §3
- change **scope** (something moves in or out of bounds) → update §5
- make a significant **architecture/design decision** → add an ADR in `docs/adr/`
  and reference it in §6
- change **how to run** the project → update §8 and `docs/mvp-run-guide.md`

A Kiro hook (`.kiro/hooks/report-update-reminder.json`) reminds you to update this
file whenever contract or web source changes. The reminder is advisory — the
actual edit is manual so the wording stays accurate.
