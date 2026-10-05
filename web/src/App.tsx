import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract, getLocalSigner, getReadContract } from "./lib/contract";
import { DEMO, CRED_LABELS } from "./lib/demo";
import { getCredentialDetails } from "./lib/data";
import { dataSource } from "./lib/supabase";
import type { CredentialDetail } from "./lib/types";

type CredView = { id: string; label: string; valid: boolean };

// off-chain credential detail joined with its on-chain validity
type JoinedCred = CredentialDetail & { onChainValid: boolean };

export default function App() {
  const [connected, setConnected] = useState(false);
  const [creds, setCreds] = useState<CredView[]>([]);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [firstInvalid, setFirstInvalid] = useState<string>("");
  const [approved, setApproved] = useState<boolean>(false);
  const [offChain, setOffChain] = useState<JoinedCred[]>([]);
  const [log, setLog] = useState<string>("Connect to the local node to begin.");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const say = (m: string) => setLog((l) => `${m}\n${l}`);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const c = getReadContract();
      const ids = [DEMO.craneCred, DEMO.operatorCred];
      const views: CredView[] = [];
      for (const cid of ids) {
        const valid = await c.isCredentialValid(cid);
        views.push({ id: cid, label: CRED_LABELS[cid] ?? cid, valid });
      }
      setCreds(views);

      const [elig, invalid] = await c.checkEligibility(DEMO.activity);
      setEligible(elig);
      setFirstInvalid(invalid === ethers.ZeroHash ? "" : invalid);

      const [, , appr] = await c.getActivity(DEMO.activity);
      setApproved(appr);
      setConnected(true);

      // off-chain metadata joined with on-chain validity (via on_chain_id)
      const details = await getCredentialDetails();
      const joined: JoinedCred[] = [];
      for (const d of details) {
        const onChainValid = d.on_chain_id ? await c.isCredentialValid(d.on_chain_id) : false;
        joined.push({ ...d, onChainValid });
      }
      setOffChain(joined);
    } catch (e: any) {
      setError(
        "Could not read contract. Is the local node running, deployed and seeded? " +
          (e?.shortMessage ?? e?.message ?? "")
      );
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function tx(label: string, run: () => Promise<ethers.ContractTransactionResponse>) {
    setBusy(true);
    setError("");
    try {
      say(`→ ${label} ...`);
      const t = await run();
      await t.wait();
      say(`✓ ${label} (tx ${t.hash.slice(0, 10)}…)`);
      await refresh();
    } catch (e: any) {
      const msg = e?.shortMessage ?? e?.reason ?? e?.message ?? "transaction failed";
      setError(`${label}: ${msg}`);
      say(`✗ ${label}: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  const revokeCrane = () =>
    tx("Issuer revokes crane inspection", async () => {
      const c = getContract(getLocalSigner("issuer"));
      return c.revokeCredential(DEMO.craneCred);
    });

  const approve = () =>
    tx("Project owner approves clearance", async () => {
      const c = getContract(getLocalSigner("projectOwner"));
      return c.approveClearance(DEMO.activity);
    });

  return (
    <div className="wrap">
      <h1>Shared Construction Credential Network</h1>
      <p className="sub">
        Proof-of-concept credential layer for crane lifting. Demo of the core workflow:
        issue → verify → activity → eligibility → revoke → NOT ELIGIBLE.
      </p>
      <p className="sub">
        Off-chain data source:{" "}
        <span className={`badge ${dataSource === "supabase" ? "ok" : "muted"}`}>
          {dataSource === "supabase" ? "Supabase" : "local (no credentials set)"}
        </span>
      </p>

      {!connected && (
        <div className="card">
          <p className="err">{error || "Not connected."}</p>
          <button onClick={refresh}>Retry connection</button>
        </div>
      )}

      {connected && (
        <>
          <div className="card">
            <h2>Lifting activity eligibility</h2>
            <div className="row">
              {eligible === null ? (
                <span className="badge muted">unknown</span>
              ) : eligible ? (
                <span className="badge ok">ELIGIBLE</span>
              ) : (
                <span className="badge bad">NOT ELIGIBLE</span>
              )}
              {approved && <span className="badge ok">CLEARANCE APPROVED</span>}
            </div>
            {firstInvalid && (
              <p className="mono">
                blocking credential: {CRED_LABELS[firstInvalid] ?? firstInvalid}
              </p>
            )}
            <div className="row" style={{ marginTop: 12 }}>
              <button disabled={busy || !eligible || approved} onClick={approve}>
                Approve clearance
              </button>
            </div>
          </div>

          <div className="card">
            <h2>Required credentials</h2>
            {creds.map((c) => (
              <div className="cred" key={c.id}>
                <div>
                  <div>{c.label}</div>
                  <div className="mono">{c.id.slice(0, 18)}…</div>
                </div>
                {c.valid ? (
                  <span className="badge ok">VALID</span>
                ) : (
                  <span className="badge bad">INVALID</span>
                )}
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Off-chain credential records</h2>
            <p className="sub" style={{ marginBottom: 10 }}>
              Metadata and documents live off-chain; the blockchain holds only the
              reference, status, and document hash. Each row links to its on-chain
              record via <span className="mono">on_chain_id</span>.
            </p>
            {offChain.length === 0 && <p className="sub">No off-chain records.</p>}
            {offChain.map((c) => (
              <div className="cred" key={c.credential_id} style={{ alignItems: "flex-start" }}>
                <div>
                  <div>
                    {c.type} — <span className="mono">{c.credential_id}</span>
                  </div>
                  <div className="mono">
                    holder: {c.holder ? ("name" in c.holder ? c.holder.name : c.holder.type) : c.holder_ref}
                  </div>
                  <div className="mono">issuer: {c.issuer}</div>
                  <div className="mono">expiry: {c.expiry ?? "—"}</div>
                  {c.document && (
                    <div className="mono">doc hash: {c.document.hash.slice(0, 18)}…</div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div>
                    <span className="mono">off-chain:</span>{" "}
                    <span className={`badge ${c.status === "VALID" ? "ok" : "bad"}`}>{c.status}</span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <span className="mono">on-chain:</span>{" "}
                    {c.onChainValid ? (
                      <span className="badge ok">VALID</span>
                    ) : (
                      <span className="badge bad">INVALID</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Issuer actions — the demo moment</h2>
            <p className="sub" style={{ marginBottom: 10 }}>
              Revoke the crane inspection and watch the activity flip to NOT ELIGIBLE.
              To reset, re-run <span className="mono">npm run seed</span> in contracts/.
            </p>
            <div className="row">
              <button className="danger" disabled={busy} onClick={revokeCrane}>
                Revoke crane inspection
              </button>
              <button className="secondary" disabled={busy} onClick={refresh}>
                Refresh
              </button>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <h2>Activity log</h2>
        <div className="log">{log}</div>
        {error && <p className="err">{error}</p>}
      </div>
    </div>
  );
}
