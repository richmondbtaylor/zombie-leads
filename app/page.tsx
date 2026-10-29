"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STATUSES } from "@/lib/leads";

type ScoredLead = { id: string; name: string; title: string; company: string; status: string; score: number; why: string };

// The dashboard: a quick look at the whole pipeline.
export default function Dashboard() {
  const [leads, setLeads] = useState<ScoredLead[] | null>(null);
  const [listCount, setListCount] = useState(0);
  const [onSequence, setOnSequence] = useState(0);

  useEffect(() => {
    fetch("/api/leads").then((r) => r.json()).then((d) => setLeads(d.leads));
    fetch("/api/lists").then((r) => r.json()).then((d) => setListCount(d.lists.length));
    fetch("/api/sequences").then((r) => r.json()).then((d) => {
      const ids = new Set<string>();
      for (const s of d.sequences) for (const e of s.enrollments) ids.add(e.leadId);
      setOnSequence(ids.size);
    });
  }, []);

  if (!leads) return <p className="muted">Loading...</p>;

  const average = leads.length ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0;
  const top5 = [...leads].sort((a, b) => b.score - a.score).slice(0, 5);
  const biggest = Math.max(1, ...STATUSES.map((s) => leads.filter((l) => l.status === s).length));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Your pipeline at a glance.</p>
        </div>
        <div className="row">
          <Link href="/leads" className="btn">Find leads</Link>
          <Link href="/sequences" className="btn ghost">Build a sequence</Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat"><div className="label">Total leads</div><div className="value">{leads.length}</div></div>
        <div className="stat"><div className="label">Average score</div><div className="value">{average}</div></div>
        <div className="stat"><div className="label">Saved lists</div><div className="value">{listCount}</div></div>
        <div className="stat"><div className="label">On a sequence</div><div className="value">{onSequence}</div></div>
      </div>

      <div className="two-col">
        <div>
          <h2>Leads by status</h2>
          <div className="card bars">
            {STATUSES.map((s) => {
              const n = leads.filter((l) => l.status === s).length;
              return (
                <div className="bar-row" key={s}>
                  <span>{s}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${(n / biggest) * 100}%` }} /></div>
                  <span className="num">{n}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2>Top 5 by score</h2>
          {top5.length === 0 ? (
            <div className="empty">No leads yet. <Link href="/leads">Add your first lead</Link>.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Company</th><th>Score</th></tr></thead>
                <tbody>
                  {top5.map((l) => (
                    <tr key={l.id}>
                      <td><Link href={`/leads/${l.id}`}>{l.name}</Link></td>
                      <td>{l.company}</td>
                      <td><span className="pill">{l.score}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
