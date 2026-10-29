"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { List } from "@/lib/leads";

type LeadRow = { id: string; name: string; title: string; company: string; email: string; score: number; status: string };

export default function ListsPage() {
  const [lists, setLists] = useState<List[] | null>(null);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLists((await (await fetch("/api/lists")).json()).lists);
    setLeads((await (await fetch("/api/leads")).json()).leads);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/lists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }) });
    const d = await res.json();
    setMessage(res.ok ? `Made the list "${d.list.name}".` : d.error);
    if (res.ok) setNewName("");
    load();
  }

  async function remove(listId: string, leadId: string) {
    const res = await fetch(`/api/lists/${listId}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId }) });
    setMessage((await res.json()).note ?? "Could not remove.");
    load();
  }

  if (!lists) return <p className="muted">Loading...</p>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Saved lists</h1>
          <p className="sub">Groups of leads you want to come back to. Add leads from the <Link href="/leads">Leads</Link> page.</p>
        </div>
      </div>
      {message && <p className="card notice" role="status">{message}</p>}

      <form className="card row" onSubmit={create}>
        <input placeholder="New list name" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ maxWidth: 280 }} />
        <button type="submit">Create list</button>
      </form>

      {lists.length === 0 && <div className="empty" style={{ marginTop: 16 }}>No lists yet. Make your first one above.</div>}

      {lists.map((list) => {
        const members = list.leadIds.map((id) => leads.find((l) => l.id === id)).filter((l): l is LeadRow => Boolean(l));
        return (
          <section key={list.id}>
            <h2>{list.name} <span className="pill">{members.length}</span></h2>
            {members.length === 0 ? (
              <div className="empty">This list is empty.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Company</th><th>Score</th><th>Status</th><th></th></tr></thead>
                  <tbody>
                    {members.map((l) => (
                      <tr key={l.id}>
                        <td><Link href={`/leads/${l.id}`}>{l.name}</Link></td>
                        <td>{l.company}</td>
                        <td><span className="pill">{l.score}</span></td>
                        <td>{l.status}</td>
                        <td><button className="danger small" onClick={() => remove(list.id, l.id)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
