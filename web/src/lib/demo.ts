import { id } from "./contract";

// Must match contracts/scripts/seed.ts DEMO ids.
export const DEMO = {
  craneCred: id("CRED-CRANE-INSPECTION-001"),
  operatorCred: id("CRED-OPERATOR-LICENCE-001"),
  activity: id("ACT-TOWER-LIFT-2026-001"),
  craneHolder: id("MACHINE-TOWER-CRANE-TC-01"),
  operatorHolder: id("WORKER-OPERATOR-W-77"),
  docHash: id("inspection-certificate-v1.pdf"),
};

export const CRED_LABELS: Record<string, string> = {
  [DEMO.craneCred]: "Crane inspection certificate",
  [DEMO.operatorCred]: "Operator licence",
};
