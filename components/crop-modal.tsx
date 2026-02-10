"use client";

import { useState, useRef, useMemo } from "react";
import ReactCrop, {
  type Crop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCroppedImg } from "@/lib/canvas-utils";
import { Crop as CropIcon, Check, X } from "lucide-react";

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (newImage: Blob) => Promise<void>;
  isDefaultCropNeeded?: boolean;
  onDone?: () => void;
}

export function CropModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
  isDefaultCropNeeded = true,
  onDone,
}: Readonly<CropModalProps>) {
  const [crop, setCrop] = useState<Crop>();
  const [enableCrop, setEnableCrop] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  /* ---------------- Image Load ---------------- */
  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (!enableCrop || !isDefaultCropNeeded) return;

    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, width / height, width, height),
      width,
      height,
    );
    setCrop(initialCrop);
  }

  /* ---------------- Preview (crop only) ---------------- */
  const handleGeneratePreview = async () => {
    if (!imgRef.current || !crop) return;

    setIsSaving(true);
    try {
      const blob = await getCroppedImg(imgRef.current, crop, "cropped.png");
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- Direct Save (no crop) ---------------- */
  const handleSaveWithoutCrop = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(corsImageUrl);
      const blob = await res.blob();
      await onSave(blob);
      onDone?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- Save from Preview ---------------- */
  const handleSaveFromPreview = async () => {
    if (!previewBlob) return;

    setIsSaving(true);
    try {
      await onSave(previewBlob);
      cleanupPreview();
      onDone?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const cleanupPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewBlob(null);
    setPreviewUrl(null);
  };

  /* ---------------- Image URL ---------------- */
  const corsImageUrl = useMemo(() => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:"))
      return imageUrl;

    try {
      const base = globalThis?.location?.origin;
      const u = new URL(imageUrl, base);
      u.searchParams.set("t", String(Date.now()));
      return u.toString();
    } catch {
      return imageUrl;
    }
  }, [imageUrl]);

  /* ======================= UI ======================= */

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        {previewUrl ? (
          /* ---------- PREVIEW (crop only) ---------- */
          <>
            <DialogHeader>
              <DialogTitle>Preview Cropped Image</DialogTitle>
            </DialogHeader>

            <div className="flex justify-center bg-muted/20 p-4 rounded-md max-h-[80vh] overflow-auto">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-full"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={cleanupPreview}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Redo
              </Button>

              <Button onClick={handleSaveFromPreview} disabled={isSaving}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* ---------- MAIN VIEW ---------- */
          <>
            <DialogHeader>
              <DialogTitle>
                {enableCrop ? "Adjust Crop" : "Confirm Image"}
              </DialogTitle>
            </DialogHeader>

            {/* Crop toggle */}
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="enableCrop"
                checked={enableCrop}
                onChange={(e) => setEnableCrop(e.target.checked)}
              />
              <label htmlFor="enableCrop" className="text-sm">
                Enable cropping
              </label>
            </div>

            <div className="flex justify-center bg-muted/20 p-4 rounded-md max-h-[80vh] overflow-auto">
              {enableCrop ? (
                <ReactCrop crop={crop} onChange={setCrop}>
                  <img
                    ref={imgRef}
                    src={corsImageUrl}
                    crossOrigin={
                      imageUrl.startsWith("blob:") ||
                      imageUrl.startsWith("data:")
                        ? undefined
                        : "anonymous"
                    }
                    onLoad={onImageLoad}
                    alt="Crop"
                    className="max-w-full"
                  />
                </ReactCrop>
              ) : (
                <img
                  ref={imgRef}
                  src={corsImageUrl}
                  alt="Original"
                  className="max-w-full"
                />
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>

              <Button
                onClick={() =>
                  enableCrop ? handleGeneratePreview() : handleSaveWithoutCrop()
                }
                disabled={isSaving}
                className="gap-2"
              >
                {enableCrop ? (
                  <>
                    <CropIcon className="h-4 w-4" />
                    Preview Crop
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Image
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
