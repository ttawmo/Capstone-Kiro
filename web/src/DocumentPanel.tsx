import { useState } from "react";
import { sha256Bytes32, registerDocument, verifyDocument } from "./lib/docs";

/**
 * Document tamper-detection panel.
 *
 * 1. Register: pick a file -> compute its SHA-256 in the browser -> store that
 *    hash on-chain (as a new credential's docHash).
 * 2. Verify: pick a file -> compute its SHA-256 -> ask the contract whether it
 *    matches the registered hash. Same file -> INTACT; modified file -> ALTERED.
 *
 * Hashing happens entirely in the browser (Web Crypto); only the 32-byte hash
 * ever touches the chain — never the document itself.
 */
export default function DocumentPanel() {
  const [registeredId, setRegisteredId] = useState<string>("");
  const [registeredHash, setRegisteredHash] = useState<string>("");
  const [result, setResult] = useState<null | boolean>(null);
  const [candidateHash, setCandidateHash] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function onRegister(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const hash = await sha256Bytes32(file);
      setMsg(`Hashing "${file.name}" … ${hash.slice(0, 18)}…`);
      const credId = await registerDocument(hash);
      setRegisteredId(credId);
      setRegisteredHash(hash);
      setMsg(`Registered "${file.name}" on-chain. Now verify a file against it.`);
    } catch (err: any) {
      setError(err?.shortMessage ?? err?.message ?? "registration failed");
    } finally {
      setBusy(false);
      e.target.value = ""; // allow re-selecting the same file
    }
  }

  async function onVerify(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!registeredId) {
      setError("Register a document first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const hash = await sha256Bytes32(file);
      setCandidateHash(hash);
      const ok = await verifyDocument(registeredId, hash);
      setResult(ok);
      setMsg(
        ok
          ? `"${file.name}" matches the registered hash.`
          : `"${file.name}" does NOT match — content differs from what was registered.`
      );
    } catch (err: any) {
      setError(err?.shortMessage ?? err?.message ?? "verification failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div className="card">
      <h2>Document integrity (SHA-256 tamper detection)</h2>
      <p className="sub" style={{ marginBottom: 10 }}>
        Hash a document in the browser and store only the 32-byte hash on-chain —
        never the file. Re-hashing a modified file no longer matches, proving
        tampering without exposing the document.
      </p>

      <div className="row">
        <label className="filebtn">
          1. Register a document
          <input type="file" disabled={busy} onChange={onRegister} hidden />
        </label>
        <label className={`filebtn ${!registeredId ? "disabled" : ""}`}>
          2. Verify a document
          <input type="file" disabled={busy || !registeredId} onChange={onVerify} hidden />
        </label>
      </div>

      {registeredHash && (
        <p className="mono" style={{ marginTop: 10 }}>
          registered hash: {registeredHash.slice(0, 26)}…
        </p>
      )}
      {candidateHash && (
        <p className="mono">checked hash:&nbsp;&nbsp;&nbsp;{candidateHash.slice(0, 26)}…</p>
      )}

      {result !== null && (
        <div className="row" style={{ marginTop: 10 }}>
          {result ? (
            <span className="badge ok">DOCUMENT INTACT</span>
          ) : (
            <span className="badge bad">DOCUMENT ALTERED</span>
          )}
        </div>
      )}

      {msg && <p className="sub" style={{ marginTop: 10 }}>{msg}</p>}
      {error && <p className="err">{error}</p>}

      <p className="sub" style={{ marginTop: 10, fontSize: 12 }}>
        Try it: register any file, then verify the <em>same</em> file (INTACT),
        then edit the file and verify again (ALTERED).
      </p>
    </div>
  );
}
