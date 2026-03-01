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
  imageAspectRatio?: number;
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
  imageAspectRatio,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setUploading = (v: boolean) => {
    setIsUploading(v);
    onUploadingChange?.(v);
  };

  async function cropImageToAspect(file: File, aspectRatio: number): Promise<File> {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || aspectRatio <= 0) {
      return file;
    }
    const objectUrl = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = objectUrl;
      });

      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      let cropW = srcW;
      let cropH = srcH;
      let offsetX = 0;
      let offsetY = 0;
      const sourceAspect = srcW / srcH;

      if (sourceAspect > aspectRatio) {
        cropW = Math.round(srcH * aspectRatio);
        offsetX = Math.round((srcW - cropW) / 2);
      } else if (sourceAspect < aspectRatio) {
        cropH = Math.round(srcW / aspectRatio);
        offsetY = Math.round((srcH - cropH) / 2);
      }

      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(img, offsetX, offsetY, cropW, cropH, 0, 0, cropW, cropH);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95)
      );
      if (!blob) return file;

      const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
      return new File([blob], `${baseName}-cropped.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } catch {
      return file;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function convertImageToWebP(file: File): Promise<File> {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return file;
    }
    try {
      const normalizedFile = imageAspectRatio
        ? await cropImageToAspect(file, imageAspectRatio)
        : file;
      const maxSizeMB =
        imageTargetMaxKB && imageTargetMaxKB > 0 ? imageTargetMaxKB / 1024 : undefined;

      const webpBlob = await imageCompression(normalizedFile, {
        maxWidthOrHeight: imageMaxWidth,
        initialQuality: imageWebpQuality,
        maxSizeMB,
        useWebWorker: true,
        fileType: "image/webp",
      });
      const baseName = normalizedFile.name.replace(/\.[^.]+$/, "") || "upload";
      const webpFile = new File([webpBlob], `${baseName}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      const savedBytes = normalizedFile.size - webpFile.size;
      const savedPercent =
        normalizedFile.size > 0 ? ((savedBytes / normalizedFile.size) * 100).toFixed(1) : "0.0";
      console.log(
        `[upload:webp] ${normalizedFile.name} -> ${webpFile.name} | ${(normalizedFile.size / 1024).toFixed(1)}KB -> ${(webpFile.size / 1024).toFixed(1)}KB | saved ${savedPercent}% | q=${imageWebpQuality}`
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
