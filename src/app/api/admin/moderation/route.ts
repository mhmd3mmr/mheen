export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDB } from "@/lib/db";
import { extractR2KeyFromImageUrl, getR2Bucket } from "@/lib/r2";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

function backUrl(request: Request) {
  const referer = request.headers.get("referer");
  if (referer) return new URL(referer);
  return new URL("/ar/admin", request.url);
}

async function tryDeleteImage(imageUrl: string | null | undefined) {
  const key = extractR2KeyFromImageUrl((imageUrl ?? "").trim());
  const bucket = getR2Bucket();
  if (!key || !bucket?.delete) return;
  try {
    await bucket.delete(key);
  } catch {}
}

export async function POST(request: Request) {
  const redirectTo = backUrl(request);
  try {
    await assertAdmin();
    const db = await getDB();
    const formData = await request.formData();
    const entity = String(formData.get("entity") ?? "").trim(); // martyr | detainee
    const op = String(formData.get("op") ?? "").trim(); // approve | delete
    const id = String(formData.get("id") ?? "").trim();

    if (!id || !["martyr", "detainee"].includes(entity) || !["approve", "delete"].includes(op)) {
      return NextResponse.redirect(redirectTo, { status: 303 });
    }

    if (entity === "martyr") {
      if (op === "approve") {
        await db.prepare(`UPDATE martyrs SET status = 'approved' WHERE id = ?`).bind(id).run();
      } else {
        const row = await db
          .prepare(`SELECT image_url FROM martyrs WHERE id = ?`)
          .bind(id)
          .first<{ image_url: string | null }>();
        await db.prepare(`DELETE FROM martyrs WHERE id = ?`).bind(id).run();
        await tryDeleteImage(row?.image_url);
      }
      revalidatePath("/[locale]/admin/martyrs", "page");
      revalidatePath("/[locale]/admin/record-of-honor", "page");
      revalidatePath("/[locale]/martyrs", "page");
      revalidatePath("/[locale]/record-of-honor", "page");
    } else {
      if (op === "approve") {
        await db.prepare(`UPDATE detainees SET status = 'approved' WHERE id = ?`).bind(id).run();
      } else {
        const row = await db
          .prepare(`SELECT image_url FROM detainees WHERE id = ?`)
          .bind(id)
          .first<{ image_url: string | null }>();
        await db.prepare(`DELETE FROM detainees WHERE id = ?`).bind(id).run();
        await tryDeleteImage(row?.image_url);
      }
      revalidatePath("/[locale]/admin/detainees", "page");
      revalidatePath("/[locale]/admin/record-of-honor", "page");
      revalidatePath("/[locale]/detainees", "page");
      revalidatePath("/[locale]/record-of-honor", "page");
    }

    return NextResponse.redirect(redirectTo, { status: 303 });
  } catch {
    return NextResponse.redirect(redirectTo, { status: 303 });
  }
}
