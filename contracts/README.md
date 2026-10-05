# contracts/

Solidity smart contracts and Hardhat tests. Owned primarily by Person 1
(contract lead) and Person 2 (integration + testing).

## Layout

```
contracts/
├── contracts/     # CredentialRegistry.sol, ActivityClearance.sol (generated from spec)
├── test/          # the 6 acceptance cases
├── scripts/       # deploy + demo seed scripts
└── hardhat.config.ts
```

## Scope

Keep the contract small — aim for 5–6 functions:
`issueCredential`, `revokeCredential`, `isCredentialValid`, `createActivity`,
`checkEligibility`, `approveClearance` (optional `recordApproval`).
Use OpenZeppelin `AccessControl` for `ISSUER_ROLE`, `CONTRACTOR_ROLE`,
`PROJECT_OWNER_ROLE`.

## The six acceptance tests (must stay green)

1. valid credential → pass
2. expired credential → fail
3. revoked credential → fail
4. wrong issuer → fail
5. all credentials valid → ELIGIBLE
6. one credential invalid → NOT ELIGIBLE

Run `npx hardhat test` before every contract PR. Contract code is generated from
the Kiro spec — do not hand-add functions beyond the agreed scope.
