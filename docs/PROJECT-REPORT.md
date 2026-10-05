# Project Report — Shared Construction Credential Network

> **Living document.** This is the single source of truth for the project's
> tasks, features, scope, tech stack, workflow, and status. **Whenever the
> project changes, update this file in the same commit.** See "Maintenance" at
> the bottom.

- **Last updated:** 2026-10-05
- **Status:** Working MVP (core workflow proven end-to-end)
- **Repository:** https://github.com/ttawmo/Capstone-Kiro
- **Timeline:** 15 days, part-time, 6-person team

---

## Contents

1. Summary
2. Project workflow (how the system behaves)
3. Project steps (phases / schedule)
4. Task tracker (done vs to-do)
5. Tech stack
6. Features
7. Scope boundaries
8. Architecture
9. Repository layout
10. How to run
11. Change log
12. Maintenance

---

## 1. Summary

A **proof-of-concept blockchain credential layer** for high-risk construction
(crane lifting). Trusted issuers record portable worker and equipment credentials
on-chain. The system checks that every required credential is valid before a
lifting activity is cleared. The blockchain sits **underneath** existing e-PTW
systems (e.g. Hubble); it does not replace them.

This is a proof-of-concept, not a production industry blockchain.

---

## 2. Project workflow (how the system behaves)

The core end-to-end flow the project proves. Step 5 (the failure case) is the
demonstration centerpiece.

```
STEP 1  Issuer issues a credential
        (MOM / Authorised Examiner / training provider)
            │
            ▼
STEP 2  Credential recorded ON-CHAIN
        ref · issuer · expiry · status · SHA-256 doc hash
            │
            ▼
STEP 3  Contractor creates a lifting activity
        assigns required credentials (crane, operator, supervisor, rigger, signalman)
            │
            ▼
STEP 4  Smart contract checks eligibility
        all required credentials valid + non-revoked + approved issuer?
            │
     ┌──────┴───────┐
     ▼              ▼
  ELIGIBLE      NOT ELIGIBLE
     │              │
     ▼              ▼
STEP 5  Project owner      Revoke ONE credential and
        approves clearance re-check → NOT ELIGIBLE
        → lift proceeds    (lift automatically blocked)
```

Who does what (roles enforced on-chain):

| Role | Can do | Contract role |
| --- | --- | --- |
| Issuer | issue, revoke credentials | `ISSUER_ROLE` |
| Contractor | create activities, request clearance | `CONTRACTOR_ROLE` |
| Project owner | approve clearance (only if eligible) | `PROJECT_OWNER_ROLE` |

Data split:
- **On-chain:** credential refs, issuer, expiry, status, revocation, document hash,
  and the eligibility logic.
- **Off-chain (planned):** PDFs, worker/machine metadata, activity detail,
  personal data (placeholders only).

---

## 3. Project steps (phases / schedule)

The 15-day plan. "MVP build" (steps that produce the working prototype) is done;
the remaining steps are integration, validation, and presentation.

| Phase | Days | Goal | Status |
| --- | --- | --- | --- |
| S0 Project setup | 1 | Repo, steering, scaffold, conventions, hooks | ✅ Done |
| S1 Architecture freeze | 1–2 | Lock stack and on/off-chain split (ADRs) | ✅ Done |
| S2 Business validation | 1–2 | Validate the pain or choose the reframe | ⬜ To do |
| S3 Contract MVP | 3–5 | issue → store → verify working | ✅ Done |
| S4 Activity + eligibility | 6–7 | create activity + eligibility check | ✅ Done |
| S5 Revoke-fails-the-lift | 8–9 | the NOT ELIGIBLE demo moment | ✅ Done |
| S6 Document hashing + polish | 10–11 | tamper detection, tests, UI polish | 🟡 Partial |
| S7 Integration freeze | 12 | no new major features after this | ⬜ To do |
| S8 Presentation + demo | 13–14 | slides, rehearse, record demo | ⬜ To do |
| S9 Buffer | 15 | bug fixes only | ⬜ To do |

Legend: ✅ done · 🟡 partial · ⬜ to do

Note: the MVP build (S0, S1, S3, S4, S5) is complete ahead of schedule. The
remaining work is business validation (S2 — the biggest project risk), optional
UI build-up (S6), and the presentation (S7–S9).

---

## 4. Task tracker (done vs to-do)

Running checklist. Check items off as they are completed and add a change-log row
(§11). Keep this in sync with §3 and §6.

### Done

- [x] T1. Create repo, steering files, and conventions
- [x] T2. Scaffold monorepo (contracts/, web/, db/, docs/)
- [x] T3. Record architecture decisions (ADR 0001–0003)
- [x] T4. Add quality-gate hooks (tests on save, tests after task)
- [x] T5. Initialise Hardhat contract package
- [x] T6. Write CredentialRegistry smart contract (6 core functions + helpers)
- [x] T7. Write the six acceptance tests + tamper test (7 passing)
- [x] T8. Write deploy script (writes address + ABI)
- [x] T9. Write demo seed script (known-good eligible state)
- [x] T10. Build React + Vite + ethers.js frontend for the core workflow
- [x] T11. Verify full flow end-to-end against a local node
- [x] T12. Write MVP run guide, demo script, presentation outline
- [x] T13. Create living project report (markdown + generated Word doc)
- [x] T15. Add a single `npm run reset` convenience for the demo (fresh node + deploy + seed); made seed idempotent

### To do

- [ ] T14. **Business validation** (S2) — confirm the pain or lock the reframe,
      by end of Day 2. Owner: Person 5 + 1. See `docs/business-validation.md`.
- [ ] T16. Wire the UI to Supabase for off-chain metadata (schema in `db/schema.sql`)
- [ ] T17. Document upload + SHA-256 hashing from the UI (contract support exists)
- [ ] T18. Issuer/contractor dashboards to create credentials & activities from the UI
- [ ] T19. Tamper-detection screen in the UI
- [ ] T20. (Optional) MetaMask wallet signing instead of local dev keys
- [ ] T21. (Optional) Add Tailwind styling (currently plain CSS — ADR 0003)
- [ ] T22. Record a clean demo video as a fallback (Day 11)
- [ ] T23. Build presentation slides from `docs/presentation-outline.md`
- [ ] T24. Rehearse the demo end-to-end (Day 13)
- [ ] T25. Set a real git author identity for the team before shared pushing

Owner column (optional): add names next to tasks as the team divides work.

---

## 5. Tech stack (actual installed versions)

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

## 6. Features

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

| # | Feature | Task | Notes |
| --- | --- | --- | --- |
| P1 | Supabase off-chain store (metadata, activities, documents) | T16 | schema ready in `db/schema.sql` |
| P2 | Document upload + hashing from the UI | T17 | contract side (`verifyDocument`) exists |
| P3 | Issuer/contractor dashboards to create data from the UI | T18 | MVP seeds via script instead |
| P4 | MetaMask wallet signing | T20 | stub in `getBrowserContract()` |
| P5 | Tamper-detection screen in the UI | T19 | contract support exists |
| P6 | Tailwind styling | T21 | currently plain CSS (ADR 0003) |

---

## 7. Scope boundaries (explicitly NOT built)

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

## 8. Architecture

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

## 9. Repository layout

| Path | Purpose |
| --- | --- |
| `contracts/` | Solidity contract, tests, deploy/seed scripts |
| `web/` | React + Vite + ethers.js frontend |
| `db/schema.sql` | Off-chain schema (planned integration) |
| `docs/` | This report, run guide, demo script, presentation, ADRs |
| `docs/report-gen/` | Generator that builds the Word copy of this report |
| `.kiro/steering/` | Shared project rules (product, tech, structure, conventions) |
| `.kiro/hooks/` | Automation (test gates, report-update + docx-regen hooks) |

---

## 10. How to run

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

**Reset to a clean ELIGIBLE state** (one command — fresh node + deploy + seed):

```bash
cd contracts && npm run reset
```

Then refresh the web app. (A revoked credential cannot be un-revoked by design,
so a full reset needs a fresh contract — which `reset` handles for you.)

---

## 11. Change log

Record every meaningful change here (newest first): date, what changed, why.

| Date | Change | Author |
| --- | --- | --- |
| 2026-10-05 | Added `npm run reset` (fresh node + deploy + seed) and made the seed script idempotent. T15 done. | — |
| 2026-10-05 | Restructured report: added project workflow (§2), project steps/phases (§3), and a done/to-do task tracker (§4). | — |
| 2026-10-05 | Added Word-document generation from the markdown source of truth. | — |
| 2026-10-05 | Initial MVP: contract + 7 tests, deploy/seed scripts, web UI, docs. Report created. | — |

---

## 12. Maintenance — keep this document current

**Rule:** when you change the project, update this report in the **same commit**.

Update this file when you:
- complete or add a **task** → tick/add it in §4 and add a §11 change-log row
- add, remove, or change a **feature** → update §6 (move between implemented/planned)
- change a **phase's status** → update §3
- change the **tech stack** or a major dependency version → update §5
- change **scope** (something moves in or out of bounds) → update §7
- make a significant **architecture/design decision** → add an ADR in `docs/adr/`
  and reference it in §8
- change **how to run** the project → update §10 and `docs/mvp-run-guide.md`

A Kiro hook (`.kiro/hooks/report-update-reminder.json`) reminds you to update this
file whenever contract or web source changes. The reminder is advisory — the
actual edit is manual so the wording stays accurate.

### Word document (`PROJECT-REPORT.docx`)

This markdown file is the **source of truth**. A Word copy
(`docs/PROJECT-REPORT.docx`) is **generated** from it, so after editing this
markdown, regenerate the `.docx` so the two stay in sync:

```bash
cd docs/report-gen && npm install   # first time only
npm run build                        # regenerates ../PROJECT-REPORT.docx
```

Do not edit the `.docx` by hand — changes there are overwritten on the next
generate. Edit the markdown, then regenerate. A Kiro hook
(`regenerate-report-docx`) also regenerates it when the markdown is saved.
