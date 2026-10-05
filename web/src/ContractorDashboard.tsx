import { useEffect, useState } from "react";
import { getContract, getLocalSigner, id } from "./lib/contract";
import { addActivity, getCredentials } from "./lib/data";
import type { CredentialRow } from "./lib/types";

/**
 * Contractor dashboard: create a lifting activity and pick the credentials it
 * requires (from the off-chain list). Writes on-chain (createActivity) and
 * off-chain (addActivity). The required credentials are passed on-chain as their
 * on_chain_id bytes32 values.
 */
export default function ContractorDashboard({ onChanged }: { onChanged: () => void }) {
  const [activityId, setActivityId] = useState("ACT-TOWER-LIFT-2026-002");
  const [project, setProject] = useState("Tower Lift 2026 - Phase 2");
  const [credentials, setCredentials] = useState<CredentialRow[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getCredentials().then(setCredentials).catch(() => setCredentials([]));
  }, []);

  function toggle(credId: string) {
    setSelected((s) => ({ ...s, [credId]: !s[credId] }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const chosen = credentials.filter((c) => selected[c.credential_id]);
      if (chosen.length === 0) throw new Error("select at least one required credential");

      const onChainActivity = id(activityId);
      const required = chosen.map((c) => c.on_chain_id ?? id(c.credential_id));

      // on-chain
      const c = getContract(getLocalSigner("contractor"));
      const tx = await c.createActivity(onChainActivity, required);
      await tx.wait();

      // off-chain
      await addActivity({
        activity_id: activityId,
        date: new Date().toISOString().slice(0, 10),
        project,
        status: "DRAFT",
      });

      setMsg(`Created activity "${activityId}" with ${chosen.length} required credential(s).`);
      onChanged();
    } catch (err: any) {
      setError(err?.shortMessage ?? err?.reason ?? err?.message ?? "create failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>Contractor dashboard — create a lifting activity</h2>
      <form onSubmit={submit}>
        <div className="field">
          <label>Activity ID</label>
          <input value={activityId} onChange={(e) => setActivityId(e.target.value)} required />
        </div>
        <div className="field">
          <label>Project</label>
          <input value={project} onChange={(e) => setProject(e.target.value)} required />
        </div>
        <div className="field">
          <label>Required credentials</label>
          <div>
            {credentials.length === 0 && <p className="sub">No credentials yet — issue one first.</p>}
            {credentials.map((c) => (
              <label key={c.credential_id} className="check">
                <input
                  type="checkbox"
                  checked={!!selected[c.credential_id]}
                  onChange={() => toggle(c.credential_id)}
                />
                {c.credential_id} <span className="mono">({c.type})</span>
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={busy}>
          Create activity
        </button>
      </form>
      {msg && <p className="sub" style={{ marginTop: 10 }}>{msg}</p>}
      {error && <p className="err">{error}</p>}
    </div>
  );
}
