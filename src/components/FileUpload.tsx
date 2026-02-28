"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";

type FileUploadProps = {
  onUploadSuccess?: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  onUploadError?: (message: string) => void;
  accept?: string;
  uploadLabel?: string;
  uploadingLabel?: string;
  folder?: string;
  imageMaxWidth?: number;
  imageWebpQuality?: number;
  imageTargetMaxKB?: number;
};

export function FileUpload({
  onUploadSuccess,
  onUploadingChange,
  onUploadError,
  accept = "image/*,.pdf,.doc,.docx",
  uploadLabel,
  uploadingLabel,
  folder = "stories",
  imageMaxWidth = 1920,
  imageWebpQuality = 0.8,
  imageTargetMaxKB,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setUploading = (v: boolean) => {
    setIsUploading(v);
    onUploadingChange?.(v);
  };

  async function convertImageToWebP(file: File): Promise<File> {
    if (!file.type.startsWith("image/") || file.type === "image/webp" || file.type === "image/svg+xml") {
      return file;
    }
    try {
      const maxSizeMB =
        imageTargetMaxKB && imageTargetMaxKB > 0 ? imageTargetMaxKB / 1024 : undefined;

      const webpBlob = await imageCompression(file, {
        maxWidthOrHeight: imageMaxWidth,
        initialQuality: imageWebpQuality,
        maxSizeMB,
        useWebWorker: true,
        fileType: "image/webp",
      });
      const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
      const webpFile = new File([webpBlob], `${baseName}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      const savedBytes = file.size - webpFile.size;
      const savedPercent = file.size > 0 ? ((savedBytes / file.size) * 100).toFixed(1) : "0.0";
      console.log(
        `[upload:webp] ${file.name} -> ${webpFile.name} | ${(file.size / 1024).toFixed(1)}KB -> ${(webpFile.size / 1024).toFixed(1)}KB | saved ${savedPercent}% | q=${imageWebpQuality}`
      );

      return webpFile;
    } catch (err) {
      console.warn("[upload:webp] conversion failed, using original file", err);
      return file;
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onUploadError?.("");
    try {
      const optimizedFile = await convertImageToWebP(file);
      const formData = new FormData();
      formData.set("file", optimizedFile);
      formData.set("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data?.url) {
          onUploadSuccess?.(data.url);
          return;
        }
      }
      onUploadError?.("فشل رفع الملف. يرجى المحاولة لاحقاً. / File upload failed. Please try again.");
    } catch (err) {
      console.error("File upload failed:", err);
      onUploadError?.("فشل رفع الملف. يرجى المحاولة لاحقاً. / File upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 py-8 transition-colors hover:border-primary/40 hover:bg-primary/10">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary/60" aria-hidden />
            <span className="mt-2 text-sm font-medium text-foreground/80">
              {uploadingLabel ?? "Uploading…"}
            </span>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-primary/60" aria-hidden />
            <span className="mt-2 text-sm text-foreground/70">
              {uploadLabel ?? "Choose file"}
            </span>
          </>
        )}
      </label>
    </div>
  );
}
