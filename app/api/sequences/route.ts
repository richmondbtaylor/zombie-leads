import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { Lead } from "@/lib/leads";
import { fillTemplate, type Enrollment, type Sequence } from "@/lib/sequences";

// GET /api/sequences  every sequence with the leads on it and a preview of each lead's next message
export async function GET() {
  const db = await readDb();
  const leads = db.leads as Lead[];
  const sequences = (db.sequences as Sequence[]).map((seq) => ({
    ...seq,
    enrollments: (db.enrollments as Enrollment[])
      .filter((e) => e.sequenceId === seq.id)
      .map((e) => {
        const lead = leads.find((l) => l.id === e.leadId);
        const step = seq.steps[e.step - 1];
        return {
          ...e,
          leadName: lead?.name ?? "Deleted lead",
          leadEmail: lead?.email ?? "",
          optedOut: lead?.optedOut ?? false,
          nextDay: step?.day ?? null,
          preview: lead && step ? fillTemplate(step.message, lead) : "",
        };
      }),
  }));
  return NextResponse.json({ sequences });
}

// POST /api/sequences  body: { name, steps: [{ day, message }, ...3 steps] }
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b?.name || !String(b.name).trim()) return NextResponse.json({ error: "Sequence name is required." }, { status: 400 });
  const rawSteps = Array.isArray(b.steps) ? b.steps : [];
  const steps = rawSteps
    .map((s: { day?: unknown; message?: unknown }) => ({ day: Math.max(0, Number(s.day) || 0), message: String(s.message ?? "").trim() }))
    .filter((s: { message: string }) => s.message);
  if (steps.length !== 3) return NextResponse.json({ error: "A sequence needs 3 steps, each with a message." }, { status: 400 });

  const seq: Sequence = { id: newId(), name: String(b.name).trim(), steps };
  const db = await readDb();
  (db.sequences as Sequence[]).push(seq);
  await writeDb(db);
  return NextResponse.json({ sequence: seq }, { status: 201 });
}
