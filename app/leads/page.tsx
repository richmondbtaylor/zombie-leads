"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { STATUSES, type List } from "@/lib/leads";

type ScoredLead = {
  id: string; name: string; title: string; company: string; email: string;
  industry: string; city: string; status: string; score: number; why: string; optedOut?: boolean;
};

const EMPTY = { name: "", title: "", company: "", companySize: "", email: "", industry: "", city: "" };

export default function Home() {
  const [leads, setLeads] = useState<ScoredLead[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [minScore, setMinScore] = useState("0");
  const [picked, setPicked] = useState<string[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [csv, setCsv] = useState("name,title,company,email,industry,city\n");
  const [newList, setNewList] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const qs = new URLSearchParams({ industry, city, minScore });
    const res = await fetch(`/api/leads?${qs}`);
    setLeads((await res.json()).leads);
    setLists((await (await fetch("/api/lists")).json()).lists);
  }, [industry, city, minScore]);

  useEffect(() => { load(); }, [load]);

  // Filter menus are built from the leads we have now.
  const industries = [...new Set(leads.map((l) => l.industry))].filter(Boolean);
  const cities = [...new Set(leads.map((l) => l.city))].filter(Boolean);

  async function send(url: string, method: string, body?: unknown) {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.error ?? "Something went wrong.");
    else setMessage(data.note ?? "Done.");
    await load();
    return res.ok;
  }

  async function addLead(e: React.FormEvent) {
    e.preventDefault();
    if (await send("/api/leads", "POST", form)) setForm(EMPTY);
  }

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Leads</h1>
          <p className="sub">Find people, score them, and save them to lists.</p>
        </div>
        <button className="ghost" onClick={() => send("/api/export", "GET")}>Export CSV</button>
      </div>
      {message && <p className="card notice" role="status">{message}</p>}

      <div className="card row">
        <label>Industry
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
            <option value="">All</option>
            {industries.map((i) => <option key={i}>{i}</option>)}
          </select>
        </label>
        <label>City
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Min score
          <input type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(e.target.value)} />
        </label>
      </div>

      <h2>{leads.length} leads</h2>
      <div className="table-wrap wide">
        <table>
          <thead>
            <tr><th></th><th>Name</th><th>Title</th><th>Company</th><th>Email</th><th>Industry</th><th>City</th><th>Score</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr><td colSpan={10}><div className="empty">No leads match these filters.</div></td></tr>
            )}
            {leads.map((l) => (
              <tr key={l.id}>
                <td><input type="checkbox" checked={picked.includes(l.id)} onChange={() => toggle(l.id)} /></td>
                <td><Link href={`/leads/${l.id}`}>{l.name}</Link>{l.optedOut && <> <span className="pill bad">opted out</span></>}</td>
                <td>{l.title}</td>
                <td>{l.company}</td>
                {/* ZOMBIE: the email is shown to everyone, with no consent source. The opt-out flag exists but nothing uses it yet. */}
                <td>{l.email || <span className="muted">none</span>}</td>
                <td>{l.industry}</td>
                <td>{l.city}</td>
                <td title={l.why}><span className="pill">{l.score}</span><div className="muted small-text">{l.why}</div></td>
                <td>
                  <select value={l.status} onChange={(e) => send(`/api/leads/${l.id}`, "PATCH", { status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td><button className="ghost small" onClick={() => send(`/api/leads/${l.id}/enrich`, "POST")}>Enrich</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Add to a list</h2>
      <div className="card stack">
        <div className="row">
          {lists.length === 0 && <span className="muted">No lists yet. Make one below.</span>}
          {lists.map((list) => (
            <button key={list.id} className="ghost small" disabled={picked.length === 0}
              onClick={() => send(`/api/lists/${list.id}`, "POST", { leadIds: picked })}>
              Add {picked.length} selected to &quot;{list.name}&quot; ({list.leadIds.length})
            </button>
          ))}
        </div>
        <div className="row">
          <input placeholder="New list name" value={newList} onChange={(e) => setNewList(e.target.value)} style={{ maxWidth: 260 }} />
          <button onClick={async () => { if (await send("/api/lists", "POST", { name: newList })) setNewList(""); }}>Create list</button>
        </div>
      </div>

      <p className="muted"><Link href="/lists">See all saved lists</Link></p>

      <h2>Add a lead</h2>
      <form className="card grid" onSubmit={addLead}>
        {(Object.keys(EMPTY) as (keyof typeof EMPTY)[]).map((k) => (
          <label key={k}>{k}
            <input value={form[k]} required={k === "name"} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </label>
        ))}
        <div className="row"><button type="submit">Add lead</button></div>
      </form>

      <h2>Import CSV</h2>
      <div className="card stack">
        <textarea rows={4} value={csv} onChange={(e) => setCsv(e.target.value)} />
        <div><button onClick={() => send("/api/leads/import", "POST", { csv })}>Import</button></div>
      </div>
    </>
  );
}
