# Demo Script

The demo is the project. Build toward this ending from Day 1. The centerpiece is
**Step 5 — revoking one credential turns a cleared lift into a blocked lift.**
Showing a failure is far more convincing than showing a successful transaction.

Target length: ~5 minutes of live demo inside a ~10-minute presentation.
Rehearse it. Use pre-seeded data so nothing is typed live that can fail.

---

## Setup (before you present)

- [ ] Local Ethereum node running, contract deployed, address in `.env`.
- [ ] Supabase seeded with placeholder workers, a crane, and credentials.
- [ ] Seed script leaves the system in a known good state (one activity ready,
      all credentials valid).
- [ ] Frontend running; the three dashboards load.
- [ ] A spare certificate PDF ready for the tamper-detection step.
- [ ] Browser zoom up so the room can read status badges.

---

## The narrative (who/why in one line each)

1. **Issuer issues credentials.** "MOM / an Authorised Examiner issues a crane
   inspection cert and operator qualification. These are recorded on the shared
   ledger — issuer, expiry, status, and a hash of the certificate."

2. **Credentials are on-chain.** Show the credential detail: issuer, issue date,
   expiry, status VALID, transaction reference, document hash. "No contractor
   owns this record. Anyone authorised can verify it."

3. **Contractor creates a lifting activity.** Assign crane, operator, supervisor,
   rigger, signalman. "This is where an e-PTW system like Hubble would ask: are
   all the required credentials actually valid?"

4. **Eligibility check → ELIGIBLE.** Run the check. The smart contract confirms
   every required credential is valid, non-revoked, and from an approved issuer.
   Green ELIGIBLE. "The lift can proceed."

5. **THE MOMENT — revoke one credential → NOT ELIGIBLE.** As the issuer, revoke
   the crane inspection (or let it expire). Re-run the same eligibility check.
   Red NOT ELIGIBLE, with the reason ("crane inspection REVOKED"). "Nothing else
   changed. One credential went bad and the system blocked the lift automatically
   — no email, no spreadsheet, no manual re-check."

6. **Bonus — tamper detection.** Upload a modified copy of a certificate. Its
   SHA-256 no longer matches the on-chain hash → DOCUMENT ALTERED. "We can prove a
   document wasn't forged without putting the document itself on-chain."

---

## What to say about scope (pre-empt the questions)

- "This is a proof-of-concept of the credential layer, not a production chain."
- "Real MOM/Hubble integration, government verification, and personal data are
  explicitly out of scope — see our architecture decisions."
- "We used a local Ethereum network to prove the logic; production would be a
  permissioned consortium of recognised issuers and project owners." (ADR 0001)
- "Private documents and personal data stay off-chain; only hashes and status go
  on-chain." (ADR 0002)

---

## Failure drills (rehearse these)

- Node not running → have the start command ready in a terminal tab.
- Re-running the demo → re-run the seed script to reset to the known good state.
- A step errors live → narrate from a screen-recording fallback (record a clean
  run on Day 11 as insurance).
