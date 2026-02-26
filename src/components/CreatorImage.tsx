"use client";

import { useState } from "react";
import { User } from "lucide-react";

export function CreatorImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/10 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="aspect-[4/5] w-full">
        {failed ? (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-20 w-20 text-primary/20" strokeWidth={1} />
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
