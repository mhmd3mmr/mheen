"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import imageCompression from "browser-image-compression";

type FileUploadProps = {
  onUploadSuccess?: (url: string) => void;
  onUploadSuccessDetailed?: (result: { url: string; ogUrl?: string; previewUrl?: string }) => void;
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
  generateOgVariant?: boolean;
  generatePreviewVariant?: boolean;
};

export function FileUpload({
  onUploadSuccess,
  onUploadSuccessDetailed,
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
  generateOgVariant = false,
  generatePreviewVariant = false,
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

  async function buildStoryDualVariants(file: File): Promise<{
    uiImageFile: File;
    ogImageFile: File;
  }> {
    const normalizedFile = imageAspectRatio ? await cropImageToAspect(file, imageAspectRatio) : file;
    const baseName = normalizedFile.name.replace(/\.[^.]+$/, "") || "upload";
    const uiBlob = await imageCompression(normalizedFile, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: "image/webp",
      initialQuality: 0.9,
    });
    const ogBlob = await imageCompression(normalizedFile, {
      maxSizeMB: 0.15,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.75,
    });

    return {
      uiImageFile: new File([uiBlob], `${baseName}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      }),
      ogImageFile: new File([ogBlob], `${baseName}-og.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      }),
    };
  }

  async function buildWhatsAppPreviewJpg(file: File): Promise<File> {
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return file;
    }

    const normalizedFile = imageAspectRatio ? await cropImageToAspect(file, imageAspectRatio) : file;
    const objectUrl = URL.createObjectURL(normalizedFile);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = reject;
        el.src = objectUrl;
      });

      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;
      const side = Math.min(srcW, srcH);
      const sx = Math.round((srcW - side) / 2);
      const sy = Math.round((srcH - side) / 2);

      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      if (!ctx) return normalizedFile;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, side, side, 0, 0, 300, 300);

      const tryEncode = (quality: number) =>
        new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

      // Try to keep under ~300KB by reducing quality if needed.
      let quality = 0.8;
      let blob = await tryEncode(quality);
      while (blob && blob.size > 300 * 1024 && quality > 0.55) {
        quality = Math.max(0.55, quality - 0.1);
        blob = await tryEncode(quality);
      }
      if (!blob) return normalizedFile;

      const baseName = normalizedFile.name.replace(/\.[^.]+$/, "") || "upload";
      return new File([blob], `${baseName}-wa.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } catch (err) {
      console.warn("[upload:wa-preview] build failed, skipping preview variant", err);
      return normalizedFile;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function uploadSingle(file: File, key?: string) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    if (key) formData.set("key", key);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string; publicUrl?: string; key?: string };
    return data;
  }

  async function uploadSingleFileOnly(file: File): Promise<boolean> {
    const optimizedFile = await convertImageToWebP(file);
    const data = await uploadSingle(optimizedFile);
    if (data?.url) {
      onUploadSuccess?.(data.url);
      onUploadSuccessDetailed?.({ url: data.url });
      return true;
    }
    return false;
  }

  const DUAL_UPLOAD_TIMEOUT_MS = 25000;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    onUploadError?.("");
    try {
      if (
        (generateOgVariant || generatePreviewVariant) &&
        file.type.startsWith("image/") &&
        file.type !== "image/svg+xml"
      ) {
        const dualTask = async (): Promise<boolean> => {
          const { uiImageFile, ogImageFile } = generateOgVariant
            ? await buildStoryDualVariants(file)
            : { uiImageFile: await convertImageToWebP(file), ogImageFile: await convertImageToWebP(file) };
          const previewImageFile = generatePreviewVariant ? await buildWhatsAppPreviewJpg(file) : null;

          const mainExt = ".webp";
          const ogExt = ".jpg";
          const previewExt = ".jpg";
          const safeFolder =
            folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") || "stories";
          const baseId = crypto.randomUUID();
          const mainKey = `${safeFolder}/${baseId}${mainExt}`;
          const ogKey = `${safeFolder}/${baseId}-og${ogExt}`;
          const previewKey = `${safeFolder}/${baseId}-wa${previewExt}`;

          const uploads = await Promise.all([
            uploadSingle(uiImageFile, mainKey),
            generateOgVariant ? uploadSingle(ogImageFile, ogKey) : Promise.resolve(null),
            previewImageFile ? uploadSingle(previewImageFile, previewKey) : Promise.resolve(null),
          ]);
          const [mainUpload, ogUpload, previewUpload] = uploads as [
            { url?: string } | null,
            { url?: string } | null,
            { url?: string } | null,
          ];

          if (mainUpload?.url) {
            onUploadSuccess?.(mainUpload.url);
            onUploadSuccessDetailed?.({
              url: mainUpload.url,
              ogUrl: ogUpload?.url,
              previewUrl: previewUpload?.url,
            });
            return true;
          }
          return false;
        };

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), DUAL_UPLOAD_TIMEOUT_MS);
        });

        let dualOk = false;
        try {
          dualOk = await Promise.race([dualTask(), timeoutPromise]);
        } catch (err) {
          const isTimeout = err instanceof Error && err.message === "UPLOAD_TIMEOUT";
          if (isTimeout) {
            console.warn("[FileUpload] Dual variant upload timed out, falling back to single upload.");
          }
        }

        if (dualOk) return;
        const singleOk = await uploadSingleFileOnly(file);
        if (singleOk) return;
      } else {
        const singleOk = await uploadSingleFileOnly(file);
        if (singleOk) return;
      }
      onUploadError?.("فشل رفع الملف. يرجى المحاولة لاحقاً. / File upload failed. Please try again.");
    } catch (err) {
      console.error("File upload failed:", err);
      try {
        const singleOk = await uploadSingleFileOnly(file);
        if (singleOk) return;
      } catch {
        // ignore
      }
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
