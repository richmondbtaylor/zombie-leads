"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Step } from "@/lib/sequences";

type EnrollmentRow = {
  id: string; leadId: string; leadName: string; step: number; nextDay: number | null; preview: string; optedOut: boolean;
};
type SequenceRow = { id: string; name: string; steps: Step[]; enrollments: EnrollmentRow[] };
type LeadRow = { id: string; name: string };

const NEW_STEPS = [
  { day: "0", message: "Hi {firstName}, I help {company} get more leads without extra work. Open to a quick look?" },
  { day: "3", message: "Hi {firstName}, following up on my note. Happy to share how it works." },
  { day: "7", message: "Hi {firstName}, last note from me. Should I close the loop?" },
];

export default function SequencesPage() {
  const [sequences, setSequences] = useState<SequenceRow[] | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [name, setName] = useState("");
  const [steps, setSteps] = useState(NEW_STEPS);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setSequences((await (await fetch("/api/sequences")).json()).sequences);
    setLeads((await (await fetch("/api/leads")).json()).leads);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function call(url: string, method: string, body: unknown) {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await res.json();
    setMessage(d.note ?? (res.ok ? "Done." : d.error ?? "Something went wrong."));
    await load();
    return res.ok;
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const ok = await call("/api/sequences", "POST", { name, steps });
    if (ok) { setName(""); setSteps(NEW_STEPS); setMessage("Sequence created."); }
  }

  const setStep = (i: number, key: "day" | "message", value: string) =>
    setSteps(steps.map((s, n) => (n === i ? { ...s, [key]: value } : s)));

  if (!sequences) return <p className="muted">Loading...</p>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Sequences</h1>
          <p className="sub">A short run of messages sent a few days apart. Use {"{firstName}"} and {"{company}"} in the text.</p>
        </div>
      </div>
      <p className="card notice-zombie">Not built yet: nothing is sent. A sequence only tracks who is on which step. See ZOMBIE.md.</p>
      {message && <p className="card notice" role="status">{message}</p>}

      {sequences.length === 0 && <div className="empty">No sequences yet. Make one below.</div>}

      {sequences.map((seq) => {
        const onIt = new Set(seq.enrollments.map((e) => e.leadId));
        const available = leads.filter((l) => !onIt.has(l.id));
        return (
          <section key={seq.id}>
            <h2>{seq.name} <span className="pill">{seq.enrollments.length} on it</span></h2>
            <div className="two-col">
              <div className="card">
                <ol className="steps">
                  {seq.steps.map((s, i) => (
                    <li key={i}><span className="day">Day {s.day}</span><span>{s.message}</span></li>
                  ))}
                </ol>
              </div>
              <div className="card stack">
                <strong>Add a lead</strong>
                <div className="row">
                  <select value={pick[seq.id] ?? ""} onChange={(e) => setPick({ ...pick, [seq.id]: e.target.value })} style={{ flex: 1, minWidth: 160 }}>
                    <option value="">Pick a lead...</option>
                    {available.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  <button disabled={!pick[seq.id]} onClick={async () => { await call(`/api/sequences/${seq.id}`, "POST", { leadIds: [pick[seq.id]] }); setPick({ ...pick, [seq.id]: "" }); }}>
                    Add
                  </button>
                </div>
              </div>
            </div>

            {seq.enrollments.length === 0 ? (
              <div className="empty" style={{ marginTop: 12 }}>Nobody is on this sequence yet.</div>
            ) : (
              <div className="table-wrap wide" style={{ marginTop: 12 }}>
                <table>
                  <thead><tr><th>Lead</th><th>Step</th><th>Next message</th><th></th></tr></thead>
                  <tbody>
                    {seq.enrollments.map((e) => (
                      <tr key={e.id}>
                        <td>
                          <Link href={`/leads/${e.leadId}`}>{e.leadName}</Link>
                          {e.optedOut && <> <span className="pill bad">opted out</span></>}
                        </td>
                        <td>
                          <select value={e.step} aria-label="Step" onChange={(ev) => call(`/api/sequences/${seq.id}`, "PATCH", { enrollmentId: e.id, step: Number(ev.target.value) })}>
                            {seq.steps.map((_, i) => <option key={i} value={i + 1}>Step {i + 1} of {seq.steps.length}</option>)}
                          </select>
                        </td>
                        <td>
                          <div className="muted small-text">Day {e.nextDay}</div>
                          {e.preview}
                        </td>
                        <td><button className="danger small" onClick={() => call(`/api/sequences/${seq.id}`, "DELETE", { enrollmentId: e.id })}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      <h2>New sequence</h2>
      <form className="card stack" onSubmit={create}>
        <label>Name
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Intro to local shops" />
        </label>
        {steps.map((s, i) => (
          <div className="step-form" key={i}>
            <label>Step {i + 1} day
              <input type="number" min={0} value={s.day} onChange={(e) => setStep(i, "day", e.target.value)} />
            </label>
            <label>Step {i + 1} message
              <textarea rows={2} required value={s.message} onChange={(e) => setStep(i, "message", e.target.value)} />
            </label>
          </div>
        ))}
        <div><button type="submit">Create sequence</button></div>
      </form>
    </>
  );
}
