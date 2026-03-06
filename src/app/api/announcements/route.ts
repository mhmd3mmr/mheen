export const runtime = "edge";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  deleteAnnouncement,
} from "@/lib/api/announcements";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (id) {
      const announcement = await getAnnouncementById(id);
      if (!announcement) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ announcement });
    }

    const limitRaw = Number(searchParams.get("limit") ?? 20);
    const offsetRaw = Number(searchParams.get("offset") ?? 0);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 && limitRaw <= 100
        ? Math.trunc(limitRaw)
        : 20;
    const offset =
      Number.isFinite(offsetRaw) && offsetRaw >= 0 ? Math.trunc(offsetRaw) : 0;

    const rows = await getAnnouncements(limit + 1, offset);
    const hasMore = rows.length > limit;
    const announcements = hasMore ? rows.slice(0, limit) : rows;

    return NextResponse.json({
      announcements,
      pagination: { limit, offset, hasMore },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load announcements";
    return NextResponse.json({ announcements: [], error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role ?? "public";
    const userId = (session?.user as { id?: string } | null)?.id ?? "";
    if (!session?.user || !["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!userId) {
      return NextResponse.json({ error: "User id missing" }, { status: 400 });
    }

    const body = (await request.json()) as {
      title_ar?: string;
      title_en?: string | null;
      content_ar?: string;
      content_en?: string | null;
      image_url?: string | null;
      type?: string | null;
    };

    const titleAr = String(body.title_ar ?? "").trim();
    const contentAr = String(body.content_ar ?? "").trim();
    if (!titleAr || !contentAr) {
      return NextResponse.json(
        { error: "Arabic title and content are required" },
        { status: 400 }
      );
    }

    const result = await createAnnouncement({
      title_ar: titleAr,
      title_en: body.title_en ?? null,
      content_ar: contentAr,
      content_en: body.content_en ?? null,
      image_url: body.image_url ?? null,
      type: body.type ?? null,
      author_id: userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create announcement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role ?? "public";
    const userId = (session?.user as { id?: string } | null)?.id ?? "";
    if (!session?.user || !["admin", "editor"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = (await request.json()) as { id?: string };
    const announcementId = String(id ?? "").trim();
    if (!announcementId) {
      return NextResponse.json(
        { error: "Announcement id is required" },
        { status: 400 }
      );
    }

    if (role === "editor") {
      const announcement = await getAnnouncementById(announcementId);
      if (!announcement) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      if (announcement.author_id !== userId) {
        return NextResponse.json(
          { error: "You can only delete your own announcements" },
          { status: 403 }
        );
      }
    }

    const result = await deleteAnnouncement(announcementId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete announcement";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

