# Repository Structure

Single monorepo with clear boundaries so six people can work in parallel without
stepping on each other.

```
Capstone-Kiro/
├── contracts/              # Solidity + Hardhat (Person 1 & 2)
│   ├── contracts/          # CredentialRegistry.sol, ActivityClearance.sol
│   ├── test/               # Hardhat unit tests (the 6 acceptance cases)
│   ├── scripts/            # deploy + seed scripts
│   └── hardhat.config.ts
├── web/                    # React + TS + Vite + Tailwind (Person 3)
│   ├── src/
│   │   ├── pages/          # IssuerDashboard, ContractorDashboard, Verification
│   │   ├── components/
│   │   └── lib/            # ethers.js client, Supabase client
│   └── index.html
├── db/                     # Supabase schema + migrations (Person 4)
│   └── schema.sql
├── docs/                   # README assets, diagrams
│   └── adr/                # Architecture Decision Records
├── .env.example            # documented env vars, no real secrets
├── .kiro/                  # steering, specs, hooks
└── README.md
```

## Where things live

- Smart contract logic → `contracts/contracts/`
- Contract tests (valid/expired/revoked/wrong-issuer/eligible/not-eligible) → `contracts/test/`
- Deployment and demo seed data → `contracts/scripts/`
- UI pages → `web/src/pages/` (keep it to a handful of screens, not 15)
- ethers.js and Supabase clients → `web/src/lib/`
- Database schema → `db/schema.sql`
- Big decisions (Fabric vs local chain, on/off-chain split, permissioned target)
  → `docs/adr/`

## Database tables (off-chain)

```
workers:    worker_id, name, role, company
machines:   machine_id, type, owner
credentials: credential_id, holder/asset ref, type, issuer, expiry, status, on_chain_id
activities: activity_id, date, project, status
activity_members: activity_id, member_ref, required_role
documents:  document_id, credential_id, file_url, hash
```

Keep blockchain IDs linked to off-chain rows via `on_chain_id` so the two layers
stay connected and nothing floats in isolation.
