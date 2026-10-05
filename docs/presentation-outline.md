# Presentation Outline (~10 minutes)

A skeleton so the slides and the demo tell one story. Every team member should be
able to explain the full chain, not just their own part.

Full chain to internalise:
`issuer → credential → blockchain → activity → eligibility check → clearance`

---

## Slide plan

1. **Title** — project name, team, one-line description.

2. **The problem** (the motivation slide — driven by `business-validation.md`)
   - State the chosen position: validated pain *or* the independent-verifiability
     reframe. One clear problem statement, backed by evidence or by the
     trust-boundary argument.

3. **Who the parties are** — MOM / Authorised Examiners / training providers,
   contractors, project owners, e-PTW vendors. Nobody today shares one trusted,
   independently verifiable credential record.

4. **The idea** — a shared blockchain credential layer that sits *underneath*
   existing e-PTW systems (Hubble), not replacing them.

5. **Architecture** — the diagram from the README: issuers → blockchain layer →
   e-PTW → PTW approval. Call out on-chain vs off-chain (hashes/status on-chain;
   PDFs/personal data off-chain).

6. **LIVE DEMO** (~5 min) — follow `demo-script.md`. Land Step 5 (revoke →
   NOT ELIGIBLE) as the climax. Finish with tamper detection if time allows.

7. **What we proved vs what production needs** — be honest about scope.
   - Proved: credential issuance, on-chain verification, eligibility logic, the
     revoke-blocks-the-lift behaviour, tamper detection.
   - Production: permissioned consortium, real issuer integrations, governance,
     scale. (Reference ADR 0001 / 0002.)

8. **Key decisions** — one slide: local Ethereum over Fabric; hashes on-chain /
   data off-chain; role-based governance model. Short, confident, defensible.

9. **Close** — restate the value in one line and the realistic path to adoption.

---

## Speaking roles (suggested)

- Problem + parties: Person 5 (owns the validation story).
- Idea + architecture: a technical lead.
- Live demo: whoever built the eligibility flow (knows the failure modes).
- Decisions + scope honesty: another technical member.

Rehearse once end-to-end on Day 13. Record a clean demo run on Day 11 as a
fallback in case the live run misbehaves.
