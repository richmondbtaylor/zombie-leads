import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { logActivity, type Lead } from "@/lib/leads";

// POST /api/leads/:id/notes  body: { text }
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { text } = await req.json().catch(() => ({ text: "" }));
  if (!text || !String(text).trim()) return NextResponse.json({ error: "Write something first." }, { status: 400 });

  const db = await readDb();
  const lead = (db.leads as Lead[]).find((l) => l.id === id);
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const note = { id: newId(), at: new Date().toISOString(), text: String(text).trim() };
  if (!lead.notes) lead.notes = [];
  lead.notes.unshift(note);
  logActivity(lead, "Note added");
  await writeDb(db);
  return NextResponse.json({ note }, { status: 201 });
}
