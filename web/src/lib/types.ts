// Types mirroring db/schema.sql (off-chain store). Placeholder data only —
// never real NRIC/personal data.

export type Worker = {
  worker_id: string;
  name: string;
  role: "operator" | "supervisor" | "rigger" | "signalman" | string;
  company: string | null;
};

export type Machine = {
  machine_id: string;
  type: string;
  owner: string | null;
};

export type CredentialStatus = "VALID" | "EXPIRED" | "REVOKED";

export type CredentialRow = {
  credential_id: string;
  holder_ref: string; // worker_id or machine_id
  type: string;
  issuer: string;
  expiry: string | null; // ISO date
  status: CredentialStatus;
  on_chain_id: string | null; // bytes32 link to the blockchain record
};

export type ActivityRow = {
  activity_id: string;
  date: string;
  project: string;
  status: "DRAFT" | "ELIGIBLE" | "NOT_ELIGIBLE" | "CLEARED" | string;
};

export type DocumentRow = {
  document_id: string;
  credential_id: string;
  file_url: string;
  hash: string; // SHA-256
};

// A convenience view joining a credential to its holder and document.
export type CredentialDetail = CredentialRow & {
  holder?: Worker | Machine;
  document?: DocumentRow;
};
