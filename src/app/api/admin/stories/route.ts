export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { getDB } from "@/lib/db";
import { extractR2KeyFromImageUrl, getR2Bucket } from "@/lib/r2";

async function assertAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | null)?.role;
  if (!session?.user || role !== "admin") {
    throw new Error("Unauthorized");
  }
}

async function deleteStoryImageFromR2(imageUrl: string | null | undefined) {
  const key = extractR2KeyFromImageUrl((imageUrl ?? "").trim());
  const bucket = getR2Bucket();
  if (!key || !bucket?.delete) return;
  try {
    await bucket.delete(key);
  } catch {}
}

export async function PUT(request: Request) {
  // approve story
  try {
    await assertAdmin();
    const { id } = (await request.json()) as { id?: string };
    const storyId = String(id ?? "").trim();
    if (!storyId) {
      return NextResponse.json({ success: false, error: "Story id is required" }, { status: 400 });
    }

    const db = await getDB();
    await db.prepare(`UPDATE stories SET status = 'approved' WHERE id = ?`).bind(storyId).run();

    revalidatePath("/[locale]/admin/stories", "page");
    revalidatePath("/[locale]/stories", "page");
    revalidatePath("/[locale]", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to approve story";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PATCH(request: Request) {
  // update story
  try {
    await assertAdmin();
    const payload = (await request.json()) as {
      id?: string;
      author_name?: string;
      content?: string;
    };
    const id = String(payload.id ?? "").trim();
    const authorName = String(payload.author_name ?? "").trim();
    const content = String(payload.content ?? "").trim();

    if (!id) {
      return NextResponse.json({ success: false, error: "Story id is required" }, { status: 400 });
    }
    if (!authorName || !content) {
      return NextResponse.json(
        { success: false, error: "Author name and content are required" },
        { status: 400 }
      );
    }

    const db = await getDB();
    await db
      .prepare(`UPDATE stories SET author_name = ?, content = ? WHERE id = ?`)
      .bind(authorName, content, id)
      .run();

    revalidatePath("/[locale]/admin/stories", "page");
    revalidatePath("/[locale]/stories", "page");
    revalidatePath("/[locale]", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update story";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  // delete story
  try {
    await assertAdmin();
    const { id } = (await request.json()) as { id?: string };
    const storyId = String(id ?? "").trim();
    if (!storyId) {
      return NextResponse.json({ success: false, error: "Story id is required" }, { status: 400 });
    }

    const db = await getDB();
    const row = await db
      .prepare(`SELECT image_url FROM stories WHERE id = ?`)
      .bind(storyId)
      .first<{ image_url: string | null }>();

    await db.prepare(`DELETE FROM stories WHERE id = ?`).bind(storyId).run();
    await deleteStoryImageFromR2(row?.image_url);

    revalidatePath("/[locale]/admin/stories", "page");
    revalidatePath("/[locale]/stories", "page");
    revalidatePath("/[locale]", "page");
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete story";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
