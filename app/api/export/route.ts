import { NextResponse } from "next/server";

// ZOMBIE: Export CSV is not built. To do: read the leads, build CSV text,
// and return it with the header "Content-Disposition: attachment".
// Remember to leave out people who opted out.
export async function GET() {
  return NextResponse.json({ error: "Export CSV is not built yet, see ZOMBIE.md." }, { status: 501 });
}
