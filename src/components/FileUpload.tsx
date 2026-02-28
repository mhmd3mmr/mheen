"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";

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

  async function canvasToWebPBlob(
    canvas: HTMLCanvasElement,
    quality: number
  ): Promise<Blob | null> {
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
    });
  }

  async function convertImageToWebP(file: File): Promise<File> {
    if (!file.type.startsWith("image/") || file.type === "image/webp" || file.type === "image/svg+xml") {
      return file;
    }

    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image decode failed"));
        img.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      const originalWidth = image.naturalWidth || image.width;
      const originalHeight = image.naturalHeight || image.height;
      const maxSide = Math.max(originalWidth, originalHeight);
      const scale = maxSide > imageMaxWidth ? imageMaxWidth / maxSide : 1;
      canvas.width = Math.max(1, Math.round(originalWidth * scale));
      canvas.height = Math.max(1, Math.round(originalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return file;
      ctx.drawImage(image, 0, 0);

      let quality = imageWebpQuality;
      let webpBlob = await canvasToWebPBlob(canvas, quality);
      if (!webpBlob) return file;

      const targetBytes =
        imageTargetMaxKB && imageTargetMaxKB > 0 ? imageTargetMaxKB * 1024 : 0;
      // If a strict target is provided, tighten quality first, then downscale.
      if (targetBytes > 0) {
        while (webpBlob.size > targetBytes && quality > 0.45) {
          quality = Math.max(0.45, quality - 0.07);
          const retryBlob = await canvasToWebPBlob(canvas, quality);
          if (!retryBlob) break;
          webpBlob = retryBlob;
        }

        while (webpBlob.size > targetBytes && canvas.width > 700 && canvas.height > 700) {
          canvas.width = Math.round(canvas.width * 0.88);
          canvas.height = Math.round(canvas.height * 0.88);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          const retryBlob = await canvasToWebPBlob(canvas, quality);
          if (!retryBlob) break;
          webpBlob = retryBlob;
        }
      }

      const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
      const webpFile = new File([webpBlob], `${baseName}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });

      const savedBytes = file.size - webpFile.size;
      const savedPercent = file.size > 0 ? ((savedBytes / file.size) * 100).toFixed(1) : "0.0";
      console.log(
        `[upload:webp] ${file.name} -> ${webpFile.name} | ${(file.size / 1024).toFixed(1)}KB -> ${(webpFile.size / 1024).toFixed(1)}KB | saved ${savedPercent}% | quality ${quality.toFixed(2)}`
      );

      return webpFile;
    } catch (err) {
      console.warn("[upload:webp] conversion failed, using original file", err);
      return file;
    } finally {
      URL.revokeObjectURL(objectUrl);
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
