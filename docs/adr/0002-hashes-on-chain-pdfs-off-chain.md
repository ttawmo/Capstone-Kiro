# ADR 0002: Hashes on-chain, PDFs and personal data off-chain

- Status: Accepted
- Date: 2026-10-05

## Context

Credentials are backed by documents (e.g. crane inspection certificates) and
relate to workers (personal data). A blockchain is immutable and, in a consortium,
widely readable. Putting PDFs or personal data on-chain is both costly and a
privacy problem.

## Decision

Store on-chain only: credential ID, type, issuer, holder/asset ID, issue date,
expiry, status, revocation flag, and the SHA-256 hash of the document.

Store off-chain (Supabase): the actual PDFs (Supabase Storage), worker/machine
metadata, activities, site checks, PTW records, and any personal data (placeholders
only — never real NRIC/personal data).

Tamper detection: re-hash an uploaded document and compare to the on-chain hash.
Match = intact; mismatch = DOCUMENT ALTERED.

## Consequences

- Privacy-by-design: no personal data or private documents on an immutable ledger.
- The blockchain acts as a shared trust/coordination layer, not a general database.
- Tamper-evidence is demonstrable without exposing document contents.
- Clear talking point: "blockchain = shared trust layer, database = application
  data layer."
