# Team Conventions

Shared working agreements so a 6-person part-time team stays coordinated over 15
days.

## Git & branches

- `main` is always runnable. No direct commits to `main`.
- One feature branch per person per task: `feat/<area>-<short-desc>`
  (e.g. `feat/contract-revoke`, `feat/web-issuer-dashboard`).
- Open a PR into `main`; at least one teammate reviews before merge.
- Stage specific files, not `git add .`, so unrelated changes don't sneak in.
- Never commit secrets. Real `.env` stays gitignored; keep `.env.example` current.

## Commit messages

Conventional, imperative, scoped:
```
feat(contract): add isCredentialValid with expiry + revocation check
fix(web): correct eligibility status color
test(contract): add revoked-credential-fails case
docs(adr): record local-chain vs Fabric decision
```

## Testing

- The six contract acceptance tests are the project's proof and must stay green:
  valid → pass, expired → fail, revoked → fail, wrong issuer → fail,
  all valid → eligible, one invalid → not eligible.
- Do not mark a spec task "done" on red tests.
- Run `hardhat test` before every contract PR.

## Pull requests

- Small and focused — one task per PR where possible.
- Describe what changed, what was tested, and anything deferred.
- Link the spec task it completes.

## Architecture Decision Records

For any significant choice, add a short note in `docs/adr/` (one page max):
context, decision, consequences. At minimum record:
- Local Ethereum network over Hyperledger Fabric
- Hashes on-chain, PDFs/personal data off-chain
- Permissioned consortium as the production target (not the prototype)

## Schedule discipline

- Days 1–2: freeze architecture + validate the business pain (in parallel).
- Day 5: issue → store → verify must work.
- Day 7: activity + eligibility working.
- Day 9: revoke-fails-the-lift scenario working (the killer demo).
- Day 11: document hashing, polish, tests.
- **Day 12: integration freeze — no new major features.**
- Days 13–14: presentation, demo, video.
- Day 15: buffer, bug fixes only.

Protect the Day 12 freeze above all. After it, Kiro is used only for bug fixes,
demo seed data, and the demo script.

## Shared understanding

Every team member should be able to explain the full chain, regardless of their
area:
issuer → credential → blockchain → activity → eligibility check → clearance.
The presentation is only ~10 minutes; no one can afford "that's someone else's part."

## Living project report

`docs/PROJECT-REPORT.md` is the single source of truth for features, scope, tech
stack, and status. When you change the project, update the report in the **same
commit**:
- feature added/removed/changed → update the features table and add a change-log row
- tech stack or major dependency version changed → update the stack table
- scope changed (something moves in or out of bounds) → update the scope section
- significant design decision → add an ADR in `docs/adr/` and reference it

A hook (`.kiro/hooks/report-update-reminder.json`) flags this on source changes,
but the edit is manual so the wording stays accurate.
