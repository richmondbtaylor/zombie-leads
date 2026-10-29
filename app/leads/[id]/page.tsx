"use client";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { STATUSES, shortTime, type Lead } from "@/lib/leads";

type Detail = {
  lead: Lead & { score: number; why: string };
  lists: { id: string; name: string }[];
  sequences: { enrollmentId: string; sequenceId: string; name: string; step: number }[];
};

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/leads/${id}`);
    if (res.ok) setData(await res.json());
    else setError("Lead not found.");
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function patch(body: object) {
    await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    load();
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/leads/${id}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: note }) });
    if (res.ok) { setNote(""); load(); }
  }

  if (error) return <p className="error">{error} <Link href="/leads">Back to leads</Link></p>;
  if (!data) return <p className="muted">Loading...</p>;
  const { lead, lists, sequences } = data;

  return (
    <>
      <p className="muted small-text"><Link href="/leads">Leads</Link> / {lead.name}</p>
      <div className="page-head">
        <div>
          <h1>{lead.name}</h1>
          <p className="sub">{lead.title || "No title"} at {lead.company || "no company"}</p>
        </div>
        <div className="row">
          <select value={lead.status} onChange={(e) => patch({ status: e.target.value })} aria-label="Status">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button className={lead.optedOut ? "ghost" : "danger"} onClick={() => patch({ optedOut: !lead.optedOut })}>
            {lead.optedOut ? "Remove opt-out" : "Mark as opted out"}
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="label">Score</div><div className="value">{lead.score}</div></div>
        <div className="stat"><div className="label">Status</div><div className="value" style={{ fontSize: 20 }}>{lead.status}</div></div>
        <div className="stat"><div className="label">Lists</div><div className="value">{lists.length}</div></div>
        <div className="stat"><div className="label">Sequences</div><div className="value">{sequences.length}</div></div>
      </div>
      {lead.optedOut && <p className="card notice-zombie">This person asked not to be emailed. Nothing in the app enforces that yet, see ZOMBIE.md.</p>}

      <div className="two-col">
        <div>
          <h2>Details</h2>
          <dl className="card details">
            <dt>First name</dt><dd>{lead.firstName || <span className="muted">none</span>}</dd>
            <dt>Title</dt><dd>{lead.title || <span className="muted">none</span>}</dd>
            <dt>Company</dt><dd>{lead.company || <span className="muted">none</span>}</dd>
            <dt>Company size</dt><dd>{lead.companySize} people</dd>
            <dt>Email</dt><dd>{lead.email || <span className="muted">none</span>}</dd>
            <dt>Industry</dt><dd>{lead.industry || <span className="muted">none</span>}</dd>
            <dt>City</dt><dd>{lead.city || <span className="muted">none</span>}</dd>
            <dt>Opted out</dt><dd>{lead.optedOut ? "Yes" : "No"}</dd>
          </dl>
        </div>

        <div>
          <h2>Why this score?</h2>
          <div className="card stack">
            <div className="row">
              {lead.why.split(", ").map((reason) => <span className="pill" key={reason}>{reason}</span>)}
            </div>
            <span className="muted small-text">Score = title + company size + email, out of 100.</span>
          </div>

          <h2>Lists and sequences</h2>
          <div className="card stack">
            <div>
              <strong>Lists</strong>
              <div className="row">
                {lists.length === 0 && <span className="muted">Not on any list.</span>}
                {lists.map((l) => <Link key={l.id} href="/lists" className="pill">{l.name}</Link>)}
              </div>
            </div>
            <div>
              <strong>Sequences</strong>
              <div className="row">
                {sequences.length === 0 && <span className="muted">Not on any sequence.</span>}
                {sequences.map((s) => <Link key={s.enrollmentId} href="/sequences" className="pill">{s.name}: step {s.step}</Link>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <h2>Notes</h2>
          <form className="card stack" onSubmit={addNote}>
            <textarea rows={3} placeholder="Write a note about this lead" value={note} onChange={(e) => setNote(e.target.value)} />
            <div><button type="submit" disabled={!note.trim()}>Add note</button></div>
          </form>
          <div className="stack" style={{ marginTop: 12 }}>
            {(lead.notes ?? []).length === 0 && <div className="empty">No notes yet.</div>}
            {(lead.notes ?? []).map((n) => (
              <div className="card" key={n.id}>
                <div>{n.text}</div>
                <div className="muted small-text">{shortTime(n.at)}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Activity</h2>
          <div className="card">
            {(lead.activity ?? []).length === 0 && <span className="muted">Nothing has happened yet.</span>}
            <ul className="timeline">
              {(lead.activity ?? []).map((a, i) => (
                <li key={i}><span className="when">{shortTime(a.at)}</span>{a.text}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
