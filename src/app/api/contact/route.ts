export const runtime = "edge";

import { NextResponse } from "next/server";
import { createContactMessage } from "@/lib/api/contact";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name : "";
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp : "";
    const message = typeof body.message === "string" ? body.message : "";

    const result = await createContactMessage({ name, whatsapp, message });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Failed to submit." },
      { status: 500 }
    );
  }
}
