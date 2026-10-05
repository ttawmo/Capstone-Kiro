# ADR 0001: Local Ethereum network over Hyperledger Fabric

- Status: Accepted
- Date: 2026-10-05

## Context

The concept involves multiple independent parties (MOM, Authorised Examiners,
training providers, project owners, contractors, e-PTW vendors), which is a
natural fit for a permissioned consortium blockchain such as Hyperledger Fabric.
However, this is a 6-person, 15-day, part-time proof-of-concept. The innovation we
need to demonstrate is the credential + eligibility logic, not blockchain
infrastructure.

## Decision

Build the prototype on a local Ethereum-compatible network using
Solidity + Hardhat + OpenZeppelin + ethers.js. Model the multi-party structure
with role-based accounts (`ISSUER_ROLE`, `CONTRACTOR_ROLE`, `PROJECT_OWNER_ROLE`)
via OpenZeppelin `AccessControl`.

Describe a permissioned consortium (recognized issuers and project owners running
authorized nodes) only as the **production** target, not something we build now.

## Consequences

- Fast to develop; no orgs/peers/orderers/CAs/channels/chaincode overhead.
- We can still demonstrate distinct stakeholder identities and permissions.
- The presentation separates what is proven in 15 days from what real deployment
  would require — a clean, honest scope boundary.
- If a reviewer asks "why not Fabric?", this ADR is the answer.
