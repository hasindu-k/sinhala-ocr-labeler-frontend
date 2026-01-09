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
}

export function CropModal({
  isOpen,
  onClose,
  imageUrl,
  onSave,
}: Readonly<CropModalProps>) {
  const [crop, setCrop] = useState<Crop>();
  const [isSaving, setIsSaving] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    // Default crop: Center 90% of the image
    const crop = centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, width / height, width, height),
      width,
      height
    );
    setCrop(crop);
  }

  const handleGeneratePreview = async () => {
    if (imgRef.current && crop) {
      setIsSaving(true);
      try {
        const croppedBlob = await getCroppedImg(
          imgRef.current,
          crop,
          "cropped.png"
        );
        // Create a preview URL from the blob
        const url = URL.createObjectURL(croppedBlob);
        setPreviewBlob(croppedBlob);
        setPreviewUrl(url);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleConfirmSave = async () => {
    if (previewBlob) {
      setIsSaving(true);
      try {
        await onSave(previewBlob);
        handleDiscardPreview();
        onClose();
      } catch (e) {
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDiscardPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewBlob(null);
    setPreviewUrl(null);
  };

  const corsImageUrl = useMemo(() => {
    if (!imageUrl) return "";
    // Keep blob/data URLs as-is; add cache-busting only for http/https URLs
    if (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")) {
      return imageUrl;
    }
    try {
      const base = globalThis?.location?.origin;
      const u = new URL(imageUrl, base);
      u.searchParams.set("t", String(Date.now()));
      return u.toString();
    } catch {
      return imageUrl;
    }
  }, [imageUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        {previewUrl ? (
          // Preview Step
          <>
            <DialogHeader>
              <DialogTitle>Preview Cropped Image</DialogTitle>
            </DialogHeader>

            <div className="flex justify-center bg-muted/20 p-4 rounded-md overflow-auto max-h-[80vh]">
              <img
                src={previewUrl}
                alt="Cropped preview"
                className="max-w-full max-h-full"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleDiscardPreview}
                disabled={isSaving}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Discard & Redo
              </Button>
              <Button
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirm & Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Crop Selection Step
          <>
            <DialogHeader>
              <DialogTitle>Adjust Crop</DialogTitle>
            </DialogHeader>

            <div className="flex justify-center bg-muted/20 p-4 rounded-md overflow-auto max-h-[80vh]">
              <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
                <img
                  ref={imgRef}
                  src={corsImageUrl}
                  crossOrigin={
                    imageUrl.startsWith("blob:") || imageUrl.startsWith("data:")
                      ? undefined
                      : "anonymous"
                  }
                  onLoad={onImageLoad}
                  alt="Crop me"
                  className="max-w-full"
                />
              </ReactCrop>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGeneratePreview}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  "Generating..."
                ) : (
                  <>
                    <CropIcon className="h-4 w-4" />
                    Preview Crop
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
