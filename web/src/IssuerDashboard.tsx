import { useState } from "react";
import { getContract, getLocalSigner, id } from "./lib/contract";
import { addCredential, ensureHolder } from "./lib/data";

/**
 * Issuer dashboard: issue a new credential from the UI.
 *
 * Writes on-chain (issueCredential) and off-chain (addCredential), linked by
 * on_chain_id = ethers.id(credentialId). This replaces having to run the seed
 * script for every credential.
 */
export default function IssuerDashboard({ onChanged }: { onChanged: () => void }) {
  const [credentialId, setCredentialId] = useState("CRED-OPERATOR-LICENCE-002");
  const [type, setType] = useState("operator-licence");
  const [holderRef, setHolderRef] = useState("WORKER-OPERATOR-W-88");
  const [holderKind, setHolderKind] = useState<"worker" | "machine">("worker");
  const [expiry, setExpiry] = useState<string>(defaultExpiry());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function defaultExpiry() {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMsg("");
    try {
      const onChainId = id(credentialId);
      const holderOnChain = id(holderRef);
      const docHash = id("doc:" + credentialId);
      const expirySecs = expiry ? Math.floor(new Date(expiry).getTime() / 1000) : 0;

      // on-chain
      const c = getContract(getLocalSigner("issuer"));
      const tx = await c.issueCredential(onChainId, type, holderOnChain, expirySecs, docHash);
      await tx.wait();

      // off-chain
      await ensureHolder(holderRef, holderKind);
      await addCredential({
        credential_id: credentialId,
        holder_ref: holderRef,
        type,
        issuer: "UI issuer (local dev key)",
        expiry: expiry || null,
        status: "VALID",
        on_chain_id: onChainId,
      });

      setMsg(`Issued "${credentialId}" (tx ${tx.hash.slice(0, 10)}…).`);
      onChanged();
    } catch (err: any) {
      setError(err?.shortMessage ?? err?.reason ?? err?.message ?? "issue failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>Issuer dashboard — issue a credential</h2>
      <form onSubmit={submit}>
        <div className="field">
          <label>Credential ID</label>
          <input value={credentialId} onChange={(e) => setCredentialId(e.target.value)} required />
        </div>
        <div className="field">
          <label>Type</label>
          <input value={type} onChange={(e) => setType(e.target.value)} required />
        </div>
        <div className="field">
          <label>Holder ref</label>
          <input value={holderRef} onChange={(e) => setHolderRef(e.target.value)} required />
        </div>
        <div className="field">
          <label>Holder kind</label>
          <select value={holderKind} onChange={(e) => setHolderKind(e.target.value as "worker" | "machine")}>
            <option value="worker">worker</option>
            <option value="machine">machine</option>
          </select>
        </div>
        <div className="field">
          <label>Expiry</label>
          <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
        <button type="submit" disabled={busy}>
          Issue credential
        </button>
      </form>
      {msg && <p className="sub" style={{ marginTop: 10 }}>{msg}</p>}
      {error && <p className="err">{error}</p>}
    </div>
  );
}
