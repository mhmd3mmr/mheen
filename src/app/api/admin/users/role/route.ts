import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const runtime = "edge";

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function POST(request: Request) {
  try {
    await assertAdmin();
    const payload = (await request.json()) as { id?: string; role?: string };

    const id = String(payload.id ?? "").trim();
    const role = String(payload.role ?? "").trim();

    if (!id) {
      return NextResponse.json({ success: false, error: "User id is required" }, { status: 400 });
    }
    if (!["admin", "contributor", "public"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    const db = await getDB();
    await db.prepare(`UPDATE users SET role = ? WHERE id = ?`).bind(role, id).run();
    revalidatePath("/[locale]/admin/users", "page");

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update role";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
