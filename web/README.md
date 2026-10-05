# web/

React + TypeScript + Vite + Tailwind frontend. Owned primarily by Person 3.

## Layout

```
web/
├── src/
│   ├── pages/       # IssuerDashboard, ContractorDashboard, Verification
│   ├── components/
│   └── lib/         # ethers.js client, Supabase client
└── index.html
```

## Pages (keep to a handful, not 15)

- **Issuer Dashboard** — issue credential, revoke credential, view credentials.
- **Contractor Dashboard** — create activity, assign workers/equipment, request
  clearance.
- **Verification Dashboard** — credential status, eligibility result, activity
  status, credential detail (issuer, issue date, expiry, status, tx, doc hash).

Use Vite (not Next.js). The app talks to the contract via ethers.js and to
off-chain data via the Supabase client, both in `src/lib/`. Frontend code is
generated from the Kiro spec.
