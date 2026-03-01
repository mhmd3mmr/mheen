"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Calendar, ShieldAlert, MessageCircle, Facebook, Share2 } from "lucide-react";

type RecordType = "martyr" | "detainee";
type FilterType = "all" | RecordType;

type UnifiedRecord = {
  id: string;
  recordType: RecordType;
  name_ar: string;
  name_en: string;
  image_url: string | null;
  death_date?: string | null;
  birth_date?: string | null;
  martyrdom_method?: string | null;
  martyrdom_details?: string | null;
  tags?: string | null;
  arrest_date?: string | null;
  status_ar?: string | null;
  status_en?: string | null;
};

const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAACwAQCdASoQABAAPm02mUmkIyKhIggAgA2JaW7hdAAP7v2mAA==";

function normalizeImageSrc(url: string) {
  try {
    const parsed = new URL(url);
    if (
      (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
      parsed.pathname.startsWith("/api/upload")
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    return url;
  }
}

export function RecordOfHonorClient({
  initialRecords,
  locale,
  initialHasMore,
}: {
  initialRecords: UnifiedRecord[];
  locale: string;
  initialHasMore: boolean;
}) {
  const t = useTranslations("pages.recordOfHonor");
  const isAr = locale === "ar";
  const [records, setRecords] = useState<UnifiedRecord[]>(initialRecords);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((row) => {
      const passesFilter = activeFilter === "all" ? true : row.recordType === activeFilter;
      const passesSearch =
        !q || row.name_ar.toLowerCase().includes(q) || row.name_en.toLowerCase().includes(q);
      return passesFilter && passesSearch;
    });
  }, [activeFilter, records, searchQuery]);

  const totals = useMemo(
    () => ({
      all: records.length,
      martyr: records.filter((r) => r.recordType === "martyr").length,
      detainee: records.filter((r) => r.recordType === "detainee").length,
    }),
    [records]
  );

  async function handleLoadMore() {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await fetch(`/api/records/get-all?page=${nextPage}`);
      const data = (await res.json()) as { records?: UnifiedRecord[]; hasMore?: boolean };
      const nextRecords = data.records ?? [];
      setRecords((prev) => {
        const seen = new Set(prev.map((r) => `${r.recordType}-${r.id}`));
        const appended = nextRecords.filter((r) => !seen.has(`${r.recordType}-${r.id}`));
        return [...prev, ...appended];
      });
      setCurrentPage(nextPage);
      setHasMore(!!data.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="min-h-[60vh] overflow-x-hidden pb-20">
      <section className="relative overflow-hidden bg-primary px-4 pb-24 pt-16 md:px-8 md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/80 via-primary to-primary" />
        <div className="relative mx-auto max-w-6xl">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center font-qomra text-4xl font-bold text-white md:text-5xl"
          >
            {t("title")}
          </motion.h1>
          <p className="mx-auto mt-4 max-w-2xl text-center text-white/75">{t("subtitle")}</p>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-4">
        <div className="rounded-2xl border border-primary/10 bg-background p-4 shadow-lg">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                className="w-full rounded-lg border border-primary/15 bg-background py-2.5 ps-10 pe-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <FilterButton
                active={activeFilter === "all"}
                onClick={() => setActiveFilter("all")}
                label={`${t("all")} (${totals.all})`}
              />
              <FilterButton
                active={activeFilter === "martyr"}
                onClick={() => setActiveFilter("martyr")}
                label={`${t("martyrs")} (${totals.martyr})`}
              />
              <FilterButton
                active={activeFilter === "detainee"}
                onClick={() => setActiveFilter("detainee")}
                label={`${t("detainees")} (${totals.detainee})`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-primary/10 bg-background/50 p-10 text-center text-foreground/60">
            {t("noResults")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((row, index) => (
              <RecordCard
                key={`${row.recordType}-${row.id}`}
                row={row}
                isAr={isAr}
                locale={locale}
                index={index}
                martyrLabel={t("martyrs")}
                detaineeLabel={t("detainees")}
              />
            ))}
          </div>
        )}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="rounded-lg border border-primary/20 bg-background px-4 py-2 text-sm text-foreground/80 hover:bg-primary/5 disabled:opacity-60"
            >
              {isLoadingMore ? t("loadingMore") : t("loadMore")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-white"
          : "border-primary/20 text-foreground/70 hover:bg-primary/5"
      }`}
    >
      {label}
    </button>
  );
}

function RecordCard({
  row,
  isAr,
  locale,
  index,
  martyrLabel,
  detaineeLabel,
}: {
  row: UnifiedRecord;
  isAr: boolean;
  locale: string;
  index: number;
  martyrLabel: string;
  detaineeLabel: string;
}) {
  const t = useTranslations("pages.recordOfHonor");
  const name = isAr ? row.name_ar : row.name_en;
  const statusText = isAr
    ? row.status_ar || row.status_en || ""
    : row.status_en || row.status_ar || "";
  const isMartyr = row.recordType === "martyr";
  const recordAnchor = `record-${row.recordType}-${row.id}`;
  const shareUrl = `https://miheen.com/${locale}/record-of-honor#${recordAnchor}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${name} — ${shareUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const badgeClass = isMartyr
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : "border-amber-200 bg-amber-50 text-amber-700";
  const borderClass = isMartyr ? "border-rose-200/60" : "border-amber-200/60";
  const methodLabelMap: Record<string, string> = {
    combatant: t("martyrdomMethodCombatant"),
    detained_then_martyred: t("martyrdomMethodDetainedThenMartyred"),
    civilian_bombing: t("martyrdomMethodCivilianBombing"),
    other: t("martyrdomMethodOther"),
  };

  const autoTags: string[] = [];
  if (row.recordType === "detainee" && row.arrest_date) {
    autoTags.push(
      t("tagDetainedSince", { year: row.arrest_date.slice(0, 4) || row.arrest_date })
    );
  }
  if (row.recordType === "martyr" && row.martyrdom_method) {
    const methodLabel = methodLabelMap[row.martyrdom_method] ?? row.martyrdom_method;
    autoTags.push(t("tagMartyredBy", { method: methodLabel }));
  }
  if (row.recordType === "martyr" && row.martyrdom_method === "other" && row.martyrdom_details) {
    autoTags.push(row.martyrdom_details);
  }

  const manualTags = (row.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const allTags = [...autoTags, ...manualTags];
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shareOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shareOpen]);

  async function handleGeneralShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: name,
          url: shareUrl,
        });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
    } catch {
      // Ignore cancelled shares and clipboard permission errors.
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.35) }}
      id={recordAnchor}
      className={`overflow-hidden rounded-xl border bg-background shadow-sm ${borderClass}`}
    >
      <div className="relative aspect-[3/4] w-full bg-primary/5">
        {row.image_url ? (
          <Image
            src={normalizeImageSrc(row.image_url)}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
            quality={85}
            priority={index < 6}
            style={{ objectFit: "cover" }}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/30">—</div>
        )}

        <div className="absolute end-3 top-3">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}`}>
            {isMartyr ? martyrLabel : detaineeLabel}
          </span>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-qomra text-lg font-semibold text-foreground min-w-0 flex-1 truncate">{name}</h3>
          <div className="relative shrink-0" ref={shareRef}>
            <button
              type="button"
              onClick={() => setShareOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 bg-background px-2.5 py-1.5 text-xs font-medium text-foreground/80 shadow-sm hover:bg-primary/5"
              aria-label={t("shareGeneral")}
              aria-expanded={shareOpen}
              aria-haspopup="true"
            >
              <Share2 className="h-4 w-4" />
              <span>{t("shareGeneral")}</span>
            </button>
            {shareOpen && (
              <div
                className="absolute end-0 top-full z-20 mt-1 min-w-[10rem] rounded-lg border border-primary/15 bg-background py-1 shadow-lg"
                role="menu"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-foreground/80 hover:bg-primary/5"
                  role="menuitem"
                  onClick={() => setShareOpen(false)}
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("shareWhatsapp")}
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-foreground/80 hover:bg-primary/5"
                  role="menuitem"
                  onClick={() => setShareOpen(false)}
                >
                  <Facebook className="h-4 w-4" />
                  {t("shareFacebook")}
                </a>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-foreground/80 hover:bg-primary/5"
                  role="menuitem"
                  onClick={() => {
                    setShareOpen(false);
                    handleGeneralShare();
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  {t("shareGeneral")}
                </button>
              </div>
            )}
          </div>
        </div>

        {isMartyr ? (
          <>
            {row.death_date && (
              <p className="flex items-center gap-2 text-xs text-foreground/65">
                <Calendar className="h-3.5 w-3.5" />
                <span>{row.death_date}</span>
              </p>
            )}
          </>
        ) : (
          <>
            {row.arrest_date && (
              <p className="flex items-center gap-2 text-xs text-foreground/65">
                <Calendar className="h-3.5 w-3.5" />
                <span>{row.arrest_date}</span>
              </p>
            )}
            {statusText && (
              <p className="flex items-center gap-2 text-xs text-foreground/70">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span className="line-clamp-2">{statusText}</span>
              </p>
            )}
          </>
        )}

        {allTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {allTags.map((tag, i) => (
              <span
                key={`${row.id}-tag-${i}`}
                className="rounded-full border border-primary/15 bg-primary/5 px-2 py-0.5 text-[11px] text-foreground/75"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  );
}
