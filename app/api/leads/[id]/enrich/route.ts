import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { Lead } from "@/lib/leads";

// POST /api/leads/:id/enrich
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const lead = (db.leads as Lead[]).find((l) => l.id === id);
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  // ZOMBIE: fake enrichment. This writes placeholder data, not real data.
  // To do: call a real enrichment API (with consent and a lawful basis) and
  // only fill in fields it actually returns.
  if (!lead.email) lead.email = `${lead.name.toLowerCase().replace(/\s+/g, ".")}@placeholder.example.com`;
  lead.companySize = lead.companySize > 1 ? lead.companySize : 25;
  await writeDb(db);
  return NextResponse.json({ lead, note: "Placeholder data. Real enrichment is not built yet, see ZOMBIE.md." });
}
