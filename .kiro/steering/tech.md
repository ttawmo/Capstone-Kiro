# Tech Stack & Technical Rules

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + TypeScript + Vite |
| UI | Tailwind CSS |
| Blockchain | Ethereum-compatible local network |
| Smart contracts | Solidity |
| Contract dev/test | Hardhat |
| Contract libraries | OpenZeppelin |
| Blockchain interaction | ethers.js |
| Off-chain database | Supabase / PostgreSQL |
| File storage | Supabase Storage |
| Document integrity | SHA-256 hashing |
| Version control | GitHub |

Use **Vite, not Next.js** — no SSR/SEO needs. Keep the frontend a single-page app.

Do **not** introduce Hyperledger Fabric. For a 6-person, 15-day part-time team,
Fabric's orgs/peers/orderers/CAs/channels/chaincode overhead is too much. Model
the multi-party structure with role-based accounts on a local Ethereum network
instead, and describe a permissioned consortium only as the *production* target.

## On-chain vs off-chain (strict rule)

**On-chain** (the shared trust layer) stores only:
- credential ID, credential type
- issuer, holder/asset ID
- issue date, expiry, status, revocation flag
- document hash (SHA-256)

**Off-chain** (Supabase, the application data layer) stores:
- actual PDF documents (Supabase Storage)
- worker and machine metadata
- activities, activity members
- site checks and PTW records
- any personal data (use placeholders only — never real NRIC/personal data)

Never put PDFs, personal data, or inspection reports on-chain.

## Smart contract scope

Keep it small — aim for 5–6 functions total. Suggested:
- `issueCredential()`
- `revokeCredential()`
- `isCredentialValid()`
- `createActivity()`
- `checkEligibility()`
- `approveClearance()` (optional: `recordApproval()`)

Do not add functions "because you can." Stay near this scope.

## Roles / access control

Use OpenZeppelin `AccessControl` with:
- `ISSUER_ROLE` — may `issueCredential`, `revokeCredential`
- `CONTRACTOR_ROLE` — may `createActivity`, request clearance
- `PROJECT_OWNER_ROLE` — may `approveClearance`

This demonstrates a real governance model, which the concept still needs to
establish.

## Document integrity flow

Issuer uploads a certificate PDF → backend computes SHA-256 → store hash on-chain,
store PDF in Supabase Storage. Later, re-hash an uploaded file and compare to the
on-chain hash: match = intact, mismatch = DOCUMENT ALTERED. This proves tamper
detection without putting private documents on-chain.

## Security defaults

- No secrets in the repo. Provide `.env.example`; keep real `.env` gitignored.
- Validate inputs on contract functions guarded by role checks.
- Write and run the contract test suite before marking any blockchain task done.
