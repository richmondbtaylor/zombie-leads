import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { List } from "@/lib/leads";

export async function GET() {
  const db = await readDb();
  return NextResponse.json({ lists: db.lists });
}

// POST /api/lists  body: { name }
export async function POST(req: Request) {
  const { name } = await req.json().catch(() => ({ name: "" }));
  if (!name || !String(name).trim()) return NextResponse.json({ error: "List name is required." }, { status: 400 });
  const db = await readDb();
  const list: List = { id: newId(), name: String(name).trim(), leadIds: [] };
  (db.lists as List[]).push(list);
  await writeDb(db);
  return NextResponse.json({ list }, { status: 201 });
}
