-- Demo seed for the off-chain Supabase database.
-- Mirrors the on-chain demo data created by contracts/scripts/seed.ts, so the
-- off-chain metadata lines up with the blockchain records.
--
-- Placeholder data only — never real NRIC / personal data.
--
-- Run after creating the tables from db/schema.sql (e.g. in the Supabase SQL
-- editor). The on_chain_id values are keccak256(credential_id string), matching
-- ethers.id(...) used by the contract scripts and the frontend.

insert into workers (worker_id, name, role, company) values
  ('WORKER-OPERATOR-W-77', 'A. Operator (placeholder)', 'operator', 'LiftCo')
on conflict (worker_id) do nothing;

insert into machines (machine_id, type, owner) values
  ('MACHINE-TOWER-CRANE-TC-01', 'tower crane', 'LiftCo')
on conflict (machine_id) do nothing;

insert into credentials (credential_id, holder_ref, type, issuer, expiry, status, on_chain_id) values
  ('CRED-CRANE-INSPECTION-001', 'MACHINE-TOWER-CRANE-TC-01', 'crane-inspection',
   'Authorised Examiner (placeholder)', (now() + interval '1 year')::date, 'VALID',
   -- keccak256("CRED-CRANE-INSPECTION-001")
   '0x37afdce322c697592f203569f69ce68de76044db373b054d1026347ce0d66483'),
  ('CRED-OPERATOR-LICENCE-001', 'WORKER-OPERATOR-W-77', 'operator-licence',
   'Training Provider (placeholder)', (now() + interval '1 year')::date, 'VALID',
   -- keccak256("CRED-OPERATOR-LICENCE-001")
   '0xc886c61ff5862127f2d638bb448e1ea901ad8428fadd5ef88c2253d8e6fdf077')
on conflict (credential_id) do nothing;

insert into activities (activity_id, date, project, status) values
  ('ACT-TOWER-LIFT-2026-001', now()::date, 'Tower Lift 2026 (placeholder)', 'DRAFT')
on conflict (activity_id) do nothing;

insert into activity_members (activity_id, member_ref, required_role) values
  ('ACT-TOWER-LIFT-2026-001', 'MACHINE-TOWER-CRANE-TC-01', 'crane'),
  ('ACT-TOWER-LIFT-2026-001', 'WORKER-OPERATOR-W-77', 'operator')
on conflict do nothing;

insert into documents (document_id, credential_id, file_url, hash) values
  ('DOC-CRANE-INSPECTION-001', 'CRED-CRANE-INSPECTION-001',
   'local://inspection-certificate-v1.pdf',
   -- keccak256("inspection-certificate-v1.pdf")
   '0xb33c4ba11dc518b480fcf1b4fe9565e769c6a73c2e6e099617a1d91d2cef1c2f')
on conflict (document_id) do nothing;
