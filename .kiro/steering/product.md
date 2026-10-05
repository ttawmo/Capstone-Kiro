# Product: Shared Construction Credential Network

## What this project is

A proof-of-concept **blockchain credential layer** for high-risk construction
operations (crane lifting). Trusted issuers record portable worker and equipment
credentials on-chain. Existing e-PTW systems (e.g. Hubble) query that layer to
confirm the required credentials are valid before a lifting activity proceeds.

The blockchain sits **underneath** existing e-PTW systems. It does not replace
them.

## The one core workflow that must work end-to-end

This is the only thing that must be fully provable. Everything else is secondary.

1. A trusted issuer issues a credential (worker or equipment).
2. The credential is recorded on-chain (reference, issuer, expiry, status, hash).
3. A contractor creates a lifting activity and assigns workers/equipment.
4. A smart contract checks every required credential is valid, non-revoked, and
   from an approved issuer, and returns **ELIGIBLE**.
5. Revoking one credential makes the same check return **NOT ELIGIBLE**.

Step 5 — the deliberate failure case — is the centerpiece of the demo. It is far
more compelling than showing a successful transaction.

## MVP acceptance criteria

- Credential issuance: an authorized issuer can issue a worker or equipment credential.
- Credential verification: the system returns VALID / EXPIRED / REVOKED.
- Activity creation: a contractor creates a lifting activity and assigns crane,
  operator, supervisor, rigger, signalman.
- Eligibility: the smart contract evaluates all required credentials → ELIGIBLE
  when all valid.
- Failure: revoke or expire one credential → NOT ELIGIBLE, with a clear reason.
- Evidence integrity: upload a certificate → hash → on-chain. A modified
  certificate produces a different hash → DOCUMENT ALTERED.

## Scope boundaries — do NOT build

Kiro should refuse or flag any request to build these; they are explicitly out of
scope for a 15-day part-time proof-of-concept:

- Real MOM / LTA / BCA / Hubble API integration
- Real government credential verification
- NRIC or any real personal data
- Mobile app
- Tokens, NFTs, cryptocurrency, or payments
- AI, IoT
- A full PTW system or full WSH management system
- More than ~15 UI screens or more than ~6 smart-contract functions

Site-specific checks (today's lifting plan, crane position, ground condition,
weather, risk assessment, toolbox briefing, physical inspection, final PTW
approval) stay in the e-PTW system and are NOT part of the blockchain layer.

## Known business risk (first-class concern)

The weakest part of this project is proving the pain is real. We cannot yet source
evidence that contractors must re-verify credentials when workers/equipment move
between projects.

Two acceptable positions:
1. **Validated pain** — find documented evidence (WSH Council, BCA/MOM guidance,
   contractor onboarding checklists, or a practitioner interview) and lock the
   motivation around reduced admin / faster onboarding.
2. **Defensible reframe** — if evidence is weak, frame the value around
   *independent verifiability and tamper-evidence* across parties with no shared
   trust boundary: no single contractor or vendor owns the master record, and
   anyone can independently verify a credential was not forged or silently revoked.

Decide which story is being told early (by Day 2), not at the end.

## Positioning

This is a proof-of-concept demonstrating how a shared credential layer *could*
make safety-critical credentials portable and independently verifiable across
construction organizations. It is not a claim to have built the industry's
production blockchain.
