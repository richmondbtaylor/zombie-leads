import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { logActivity, type Lead, type List } from "@/lib/leads";

// POST /api/lists/:id  body: { leadIds: ["l1", "l2"] }  adds leads to the list
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { leadIds } = await req.json().catch(() => ({ leadIds: [] }));
  const db = await readDb();
  const list = (db.lists as List[]).find((l) => l.id === id);
  if (!list) return NextResponse.json({ error: "List not found." }, { status: 404 });
  for (const leadId of Array.isArray(leadIds) ? leadIds : []) {
    if (!list.leadIds.includes(String(leadId))) {
      list.leadIds.push(String(leadId));
      const lead = (db.leads as Lead[]).find((l) => l.id === String(leadId));
      if (lead) logActivity(lead, `Added to list "${list.name}"`);
    }
  }
  await writeDb(db);
  return NextResponse.json({ list });
}

// DELETE /api/lists/:id  body: { leadId }  takes one lead out of the list (the lead itself stays)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { leadId } = await req.json().catch(() => ({ leadId: "" }));
  const db = await readDb();
  const list = (db.lists as List[]).find((l) => l.id === id);
  if (!list) return NextResponse.json({ error: "List not found." }, { status: 404 });
  if (!list.leadIds.includes(String(leadId))) return NextResponse.json({ error: "That lead is not in this list." }, { status: 404 });
  list.leadIds = list.leadIds.filter((x) => x !== String(leadId));
  const lead = (db.leads as Lead[]).find((l) => l.id === String(leadId));
  if (lead) logActivity(lead, `Removed from list "${list.name}"`);
  await writeDb(db);
  return NextResponse.json({ list, note: "Removed from the list." });
}
