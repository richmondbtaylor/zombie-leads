import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import { logActivity, type Lead } from "@/lib/leads";
import type { Enrollment, Sequence } from "@/lib/sequences";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/sequences/:id  body: { leadIds: ["l1", "l2"] }  puts leads on step 1
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { leadIds } = await req.json().catch(() => ({ leadIds: [] }));
  const db = await readDb();
  const seq = (db.sequences as Sequence[]).find((s) => s.id === id);
  if (!seq) return NextResponse.json({ error: "Sequence not found." }, { status: 404 });

  let added = 0;
  for (const leadId of Array.isArray(leadIds) ? leadIds : []) {
    const lead = (db.leads as Lead[]).find((l) => l.id === String(leadId));
    if (!lead) continue;
    const already = (db.enrollments as Enrollment[]).some((e) => e.sequenceId === id && e.leadId === lead.id);
    if (already) continue;

    // ZOMBIE: nobody checks lead.optedOut here. A person who asked us to stop is added
    // to the sequence like everyone else. CAN-SPAM says never contact them. Skip them
    // (and tell the user why) before this goes anywhere near a real email.
    (db.enrollments as Enrollment[]).push({
      id: newId() + added,
      sequenceId: id,
      leadId: lead.id,
      step: 1,
      addedAt: new Date().toISOString(),
    });
    logActivity(lead, `Added to sequence "${seq.name}"`);
    added++;
  }
  await writeDb(db);
  return NextResponse.json({ added, note: "Added. Sending is not built yet, see ZOMBIE.md." });
}

// PATCH /api/sequences/:id  body: { enrollmentId, step }  moves a lead to step 1, 2 or 3 by hand
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { enrollmentId, step } = await req.json().catch(() => ({ enrollmentId: "", step: 0 }));
  const db = await readDb();
  const seq = (db.sequences as Sequence[]).find((s) => s.id === id);
  if (!seq) return NextResponse.json({ error: "Sequence not found." }, { status: 404 });
  const enrollment = (db.enrollments as Enrollment[]).find((e) => e.id === enrollmentId && e.sequenceId === id);
  if (!enrollment) return NextResponse.json({ error: "That lead is not on this sequence." }, { status: 404 });
  if (![1, 2, 3].includes(Number(step))) return NextResponse.json({ error: "Step must be 1, 2 or 3." }, { status: 400 });

  enrollment.step = Number(step);
  const lead = (db.leads as Lead[]).find((l) => l.id === enrollment.leadId);
  if (lead) logActivity(lead, `Moved to step ${step} of "${seq.name}"`);
  await writeDb(db);
  return NextResponse.json({ enrollment });
}

// DELETE /api/sequences/:id  body: { enrollmentId }  takes a lead off the sequence
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const { enrollmentId } = await req.json().catch(() => ({ enrollmentId: "" }));
  const db = await readDb();
  const all = db.enrollments as Enrollment[];
  const index = all.findIndex((e) => e.id === enrollmentId && e.sequenceId === id);
  if (index < 0) return NextResponse.json({ error: "That lead is not on this sequence." }, { status: 404 });
  all.splice(index, 1);
  await writeDb(db);
  return NextResponse.json({ note: "Removed from the sequence." });
}
