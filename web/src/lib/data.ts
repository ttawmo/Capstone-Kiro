import { supabase, hasSupabase } from "./supabase";
import { id } from "./contract";
import type {
  Worker,
  Machine,
  CredentialRow,
  ActivityRow,
  DocumentRow,
  CredentialDetail,
} from "./types";

/**
 * Off-chain data access. Backed by Supabase when configured; otherwise a local
 * in-memory store seeded to mirror the on-chain demo data (see contracts/
 * scripts/seed.ts). The on_chain_id links each off-chain credential to its
 * blockchain record via ethers.id(...) of the same string key.
 *
 * The public functions are async and identical across both backends, so the UI
 * does not care which one is active.
 */

// ---- local fallback data (mirrors the seeded on-chain demo) ----
const localWorkers: Worker[] = [
  { worker_id: "WORKER-OPERATOR-W-77", name: "A. Operator (placeholder)", role: "operator", company: "LiftCo" },
];

const localMachines: Machine[] = [
  { machine_id: "MACHINE-TOWER-CRANE-TC-01", type: "tower crane", owner: "LiftCo" },
];

const localCredentials: CredentialRow[] = [
  {
    credential_id: "CRED-CRANE-INSPECTION-001",
    holder_ref: "MACHINE-TOWER-CRANE-TC-01",
    type: "crane-inspection",
    issuer: "Authorised Examiner (placeholder)",
    expiry: isoOneYear(),
    status: "VALID",
    on_chain_id: id("CRED-CRANE-INSPECTION-001"),
  },
  {
    credential_id: "CRED-OPERATOR-LICENCE-001",
    holder_ref: "WORKER-OPERATOR-W-77",
    type: "operator-licence",
    issuer: "Training Provider (placeholder)",
    expiry: isoOneYear(),
    status: "VALID",
    on_chain_id: id("CRED-OPERATOR-LICENCE-001"),
  },
];

const localActivities: ActivityRow[] = [
  {
    activity_id: "ACT-TOWER-LIFT-2026-001",
    date: isoToday(),
    project: "Tower Lift 2026 (placeholder)",
    status: "DRAFT",
  },
];

const localDocuments: DocumentRow[] = [
  {
    document_id: "DOC-CRANE-INSPECTION-001",
    credential_id: "CRED-CRANE-INSPECTION-001",
    file_url: "local://inspection-certificate-v1.pdf",
    hash: id("inspection-certificate-v1.pdf"),
  },
];

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}
function isoOneYear() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

// ---- public API (same shape for both backends) ----

export async function getCredentials(): Promise<CredentialRow[]> {
  if (hasSupabase && supabase) {
    const { data, error } = await supabase.from("credentials").select("*");
    if (error) throw error;
    return (data ?? []) as CredentialRow[];
  }
  return structuredClone(localCredentials);
}

export async function getWorker(workerId: string): Promise<Worker | undefined> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.from("workers").select("*").eq("worker_id", workerId).maybeSingle();
    return (data ?? undefined) as Worker | undefined;
  }
  return localWorkers.find((w) => w.worker_id === workerId);
}

export async function getMachine(machineId: string): Promise<Machine | undefined> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.from("machines").select("*").eq("machine_id", machineId).maybeSingle();
    return (data ?? undefined) as Machine | undefined;
  }
  return localMachines.find((m) => m.machine_id === machineId);
}

export async function getDocumentForCredential(credentialId: string): Promise<DocumentRow | undefined> {
  if (hasSupabase && supabase) {
    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("credential_id", credentialId)
      .maybeSingle();
    return (data ?? undefined) as DocumentRow | undefined;
  }
  return localDocuments.find((d) => d.credential_id === credentialId);
}

export async function getActivity(activityId: string): Promise<ActivityRow | undefined> {
  if (hasSupabase && supabase) {
    const { data } = await supabase.from("activities").select("*").eq("activity_id", activityId).maybeSingle();
    return (data ?? undefined) as ActivityRow | undefined;
  }
  return localActivities.find((a) => a.activity_id === activityId);
}

/**
 * Returns credentials joined with their holder (worker or machine) and document.
 * The UI uses this to show off-chain metadata next to the on-chain status.
 */
export async function getCredentialDetails(): Promise<CredentialDetail[]> {
  const creds = await getCredentials();
  const out: CredentialDetail[] = [];
  for (const c of creds) {
    const holder =
      (await getWorker(c.holder_ref)) ?? (await getMachine(c.holder_ref)) ?? undefined;
    const document = await getDocumentForCredential(c.credential_id);
    out.push({ ...c, holder, document });
  }
  return out;
}

// ---- writes (off-chain metadata) ----
// These persist the off-chain record that accompanies an on-chain write. The
// on_chain_id links the two. In local mode they mutate the in-memory arrays so
// the UI reflects new records immediately without a backend.

export async function addCredential(row: CredentialRow): Promise<void> {
  if (hasSupabase && supabase) {
    const { error } = await supabase.from("credentials").insert(row);
    if (error) throw error;
    return;
  }
  const i = localCredentials.findIndex((c) => c.credential_id === row.credential_id);
  if (i >= 0) localCredentials[i] = row;
  else localCredentials.push(row);
}

export async function addActivity(row: ActivityRow): Promise<void> {
  if (hasSupabase && supabase) {
    const { error } = await supabase.from("activities").insert(row);
    if (error) throw error;
    return;
  }
  const i = localActivities.findIndex((a) => a.activity_id === row.activity_id);
  if (i >= 0) localActivities[i] = row;
  else localActivities.push(row);
}

/** Ensure a holder (worker or machine) exists off-chain for a credential. */
export async function ensureHolder(holderRef: string, kind: "worker" | "machine"): Promise<void> {
  if (kind === "worker") {
    if (hasSupabase && supabase) {
      await supabase
        .from("workers")
        .upsert({ worker_id: holderRef, name: holderRef, role: "operator", company: null });
      return;
    }
    if (!localWorkers.find((w) => w.worker_id === holderRef)) {
      localWorkers.push({ worker_id: holderRef, name: holderRef, role: "operator", company: null });
    }
  } else {
    if (hasSupabase && supabase) {
      await supabase.from("machines").upsert({ machine_id: holderRef, type: "equipment", owner: null });
      return;
    }
    if (!localMachines.find((m) => m.machine_id === holderRef)) {
      localMachines.push({ machine_id: holderRef, type: "equipment", owner: null });
    }
  }
}
