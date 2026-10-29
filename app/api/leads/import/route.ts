import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { Lead } from "@/lib/leads";

// POST /api/leads/import  body: { csv: "name,title,company,email,industry,city\n..." }
export async function POST(req: Request) {
  const { csv } = await req.json().catch(() => ({ csv: "" }));
  const lines = String(csv).split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return NextResponse.json({ error: "Need a header row and at least one lead." }, { status: 400 });

  const db = await readDb();
  let added = 0;
  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    // ZOMBIE: bug. Only the first column (name) is read correctly. The other
    // columns are ignored, so every imported lead has no title, email, etc.
    // To do: map each column by its header name, and handle quoted commas.
    const lead: Lead = {
      id: newId() + added,
      name: (cols[0] ?? "").trim(),
      title: "",
      company: "",
      companySize: 1,
      email: "",
      industry: "",
      city: "",
      status: "New",
    };
    if (!lead.name) continue;
    (db.leads as Lead[]).push(lead);
    added++;
  }
  await writeDb(db);
  return NextResponse.json({ added });
}
