"use client";

import { useState, useCallback } from "react";
import { Share2, MessageCircle, Check } from "lucide-react";

type Props = {
  shareUrl: string;
  title: string;
  text?: string;
  isAr: boolean;
};

export function AnnouncementShareButtons({ shareUrl, title, text, isAr }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const shareData: ShareData = {
      url: shareUrl,
      title,
      ...(text && { text }),
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") copyFallback();
      }
    } else {
      copyFallback();
    }
  }, [shareUrl, title, text]);

  function copyFallback() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  }

  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-background px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            {isAr ? "تم النسخ" : "Copied"}
          </>
        ) : (
          <>
            <Share2 className="h-3.5 w-3.5" />
            {isAr ? "مشاركة" : "Share"}
          </>
        )}
      </button>
      <a
        href={whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {isAr ? "مشاركة عبر واتساب" : "Share on WhatsApp"}
      </a>
    </span>
  );
}
