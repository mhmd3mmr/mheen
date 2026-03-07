export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAllContactMessages,
  updateContactMessageStatus,
} from "@/lib/api/contact";

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role ?? "public";
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const messages = await getAllContactMessages();
    return NextResponse.json({ messages });
  } catch (err) {
    return NextResponse.json(
      { messages: [], error: "Failed to load messages." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role ?? "public";
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "";
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const result = await updateContactMessageStatus(id, status);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to update." },
      { status: 500 }
    );
  }
}
