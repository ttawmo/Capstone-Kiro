-- Off-chain schema (Supabase / PostgreSQL)
-- On-chain stores only credential refs, issuer, expiry, status, revocation, hash.
-- This database holds application data, metadata, documents, and site/PTW records.
-- Never store real NRIC / personal data here — placeholders only.

-- Workers (crane operators, lifting supervisors, riggers, signalmen, etc.)
create table if not exists workers (
    worker_id   text primary key,
    name        text not null,          -- placeholder names only
    role        text not null,          -- operator | supervisor | rigger | signalman
    company     text
);

-- Machines (cranes and other lifting equipment)
create table if not exists machines (
    machine_id  text primary key,
    type        text not null,          -- e.g. mobile crane, tower crane
    owner       text
);

-- Credentials — mirrors the on-chain record via on_chain_id.
-- holder_ref points to a worker_id or machine_id depending on type.
create table if not exists credentials (
    credential_id text primary key,
    holder_ref    text not null,        -- worker_id or machine_id
    type          text not null,        -- e.g. crane inspection, operator qualification
    issuer        text not null,        -- MOM / Authorised Examiner / training provider
    expiry        date,
    status        text not null default 'VALID',  -- VALID | EXPIRED | REVOKED
    on_chain_id   text                  -- link to the blockchain record
);

-- Lifting activities created by a contractor.
create table if not exists activities (
    activity_id text primary key,
    date        date not null,
    project     text not null,
    status      text not null default 'DRAFT'    -- DRAFT | ELIGIBLE | NOT_ELIGIBLE | CLEARED
);

-- Which members (workers/machines) fill which required role for an activity.
create table if not exists activity_members (
    activity_id   text not null references activities(activity_id),
    member_ref    text not null,        -- worker_id or machine_id
    required_role text not null,        -- crane | operator | supervisor | rigger | signalman
    primary key (activity_id, member_ref, required_role)
);

-- Documents: PDFs live in Supabase Storage; we keep the URL and SHA-256 hash.
-- The same hash is written on-chain for tamper detection.
create table if not exists documents (
    document_id   text primary key,
    credential_id text references credentials(credential_id),
    file_url      text not null,        -- Supabase Storage URL
    hash          text not null         -- SHA-256 of the file
);
