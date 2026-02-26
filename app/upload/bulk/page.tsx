"use client";

import type React from "react";
import { useState, useRef } from "react";
import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { uploadImagesAsBulkDocument } from "@/lib/documents-api";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { CropModal } from "@/components/crop-modal";

interface UploadedFile {
  name: string;
  uploadSessionId: string;
}

function renameToPng(name: string) {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? `${name.substring(0, idx)}.png` : `${name}.png`;
}

export default function BulkUploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [documentName, setDocumentName] = useState("");
  const [uploadMode, setUploadMode] = useState<"preview" | "no-preview">(
    "preview",
  );
  const [uploadSessionId, setUploadSessionId] = useState<string>("");
  const [totalFilesToUpload, setTotalFilesToUpload] = useState(0);
  const router = useRouter();

  // Image cropping flow
  const [imageQueue, setImageQueue] = useState<File[]>([]);
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const croppedFilesRef = useRef<File[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (isUploading) return;

    const trimmedDocumentName = documentName.trim();
    if (!trimmedDocumentName) {
      showToast({
        message: "Please enter a document name before uploading",
        variant: "error",
      });
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      showToast({
        message: "Please select image files for bulk upload",
        variant: "error",
      });
      return;
    }

    // Generate session ID for this bulk upload batch
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    setUploadSessionId(sessionId);

    if (uploadMode === "no-preview") {
      setIsUploading(true);
      setUploadProgress(0);
      setTotalFilesToUpload(imageFiles.length);
      await finalizeUpload(imageFiles, sessionId);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessedCount(0);
    setTotalFilesToUpload(imageFiles.length);
    setImageQueue(imageFiles);

    // Open first image for cropping
    openNextImage(imageFiles[0]);
  };

  const openNextImage = (file: File | undefined) => {
    if (!file) {
      return;
    }
    const url = URL.createObjectURL(file);
    setCurrentImageFile(file);
    setCurrentImageUrl(url);
    setIsCropOpen(true);
  };

  const closeCropModal = () => {
    if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    setIsCropOpen(false);
    setCurrentImageUrl(null);
    setCurrentImageFile(null);
  };

  // Save cropped image to queue for bulk upload later
  const handleImageSave = async (newImage: Blob) => {
    if (!currentImageFile) return;

    try {
      const croppedFile = new File(
        [newImage],
        renameToPng(currentImageFile.name),
        { type: "image/png" },
      );

      // Add to cropped files and automatically move to next
      const [_, ...rest] = imageQueue;
      setImageQueue(rest);

      let nextCount = 0;
      croppedFilesRef.current.push(croppedFile);
      nextCount = croppedFilesRef.current.length;

      setProcessedCount((prev) => {
        const nextProcessed = prev + 1;
        setUploadProgress(
          Math.round((nextProcessed / totalFilesToUpload) * 100),
        );
        return nextProcessed;
      });

      // Close modal and continue
      closeCropModal();

      if (rest.length > 0) {
        openNextImage(rest[0]);
      }

      showToast({
        message: `Image cropped (${nextCount}/${totalFilesToUpload})`,
        variant: "success",
      });

      console.log(`Cropped: ${currentImageFile.name} -> ${croppedFile.name}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save crop";
      showToast({
        message: `${currentImageFile.name}: ${message}`,
        variant: "error",
      });
    }
  };

  // Finish cropping for current image and move to next
  const handleCropDone = () => {
    const [_, ...rest] = imageQueue;
    setImageQueue(rest);
    closeCropModal();

    setProcessedCount((prev) => {
      const nextProcessed = prev + 1;
      setUploadProgress(Math.round((nextProcessed / totalFilesToUpload) * 100));
      return nextProcessed;
    });

    // Move to next image or finalize
    if (rest.length > 0) {
      openNextImage(rest[0]);
    } else {
      finalizeUpload();
    }
  };

  // Skip current image without uploading
  const handleImageSkip = () => {
    handleCropDone();
  };

  const finalizeUpload = async (
    filesOverride?: File[],
    sessionIdOverride?: string,
  ) => {
    const filesToUpload = filesOverride ?? croppedFilesRef.current;
    const effectiveSessionId = sessionIdOverride ?? uploadSessionId;
    const trimmedDocumentName = documentName.trim();

    if (filesToUpload.length === 0) {
      showToast({
        message: "No images to upload",
        variant: "error",
      });
      return;
    }

    setUploadProgress(0);

    try {
      const doc = await uploadImagesAsBulkDocument(
        filesToUpload,
        trimmedDocumentName || `bulk_upload_${effectiveSessionId}`,
      );

      setUploadedFiles([
        {
          name: doc.original_filename || "Bulk Upload",
          uploadSessionId: effectiveSessionId,
        },
      ]);

      showToast({
        message: `${filesToUpload.length} images uploaded as single document!`,
        variant: "success",
      });

      console.log("Bulk upload successful:", doc);
      console.log("Uploaded files count:", filesToUpload.length);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      showToast({
        message: `Bulk upload failed: ${message}`,
        variant: "error",
      });
    } finally {
      croppedFilesRef.current = [];
      setIsUploading(false);
      setImageQueue([]);
      setCurrentImageFile(null);
      setCurrentImageUrl(null);
      setIsCropOpen(false);
      setProcessedCount(0);
      setTotalFilesToUpload(0);
      setUploadSessionId("");
      setTimeout(() => router.push("/documents"), 1000);
    }
  };

  let uploadStatusText = "Drop images here or click to select";
  if (isUploading) {
    uploadStatusText =
      uploadMode === "preview"
        ? `Uploading... (${processedCount}/${totalFilesToUpload})`
        : "Uploading images...";
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ImageIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Bulk Upload Images</h1>
            </div>
            <p className="text-muted-foreground">
              Upload multiple images at once and crop them for your documents
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Images</CardTitle>
              <CardDescription>
                Choose upload mode, set a document name, then drag & drop images
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                value={uploadMode}
                onValueChange={(value) =>
                  setUploadMode(value as "preview" | "no-preview")
                }
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview + Crop</TabsTrigger>
                  <TabsTrigger value="no-preview">No Preview</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <p className="text-sm font-medium">Document name</p>
                <Input
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter a document name"
                  disabled={isUploading}
                />
                <p className="text-xs text-muted-foreground">
                  {uploadMode === "preview"
                    ? "Each image opens in crop preview before upload."
                    : "Images upload directly without opening crop preview."}
                </p>
              </div>

              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                  !isUploading &&
                    "cursor-pointer hover:border-primary hover:bg-accent",
                )}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={handleFileInput}
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="flex flex-col items-center cursor-pointer w-full"
                >
                  {isUploading ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  )}
                  <p className="text-lg font-medium mb-2">{uploadStatusText}</p>
                  <p className="text-sm text-muted-foreground text-center">
                    Support for JPG, PNG, GIF, WebP and other image formats.
                    <br />
                    {uploadMode === "preview"
                      ? "You can crop each image individually before upload."
                      : "All selected images will upload directly as one document."}
                  </p>
                </label>

                {isUploading && (
                  <div className="w-full max-w-sm mt-6">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Uploaded Images</CardTitle>
                    <CardDescription>
                      {uploadedFiles.length} image
                      {uploadedFiles.length === 1 ? "" : "s"} successfully
                      uploaded
                    </CardDescription>
                  </div>
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Bulk Upload
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={`${file.uploadSessionId}-${file.name}`}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    </div>
                  ))}
                </div>

                {!isUploading && uploadedFiles.length > 0 && (
                  <div className="mt-6 pt-6 border-t flex gap-3">
                    <Button
                      onClick={() => router.push("/documents")}
                      className="flex-1"
                    >
                      View Documents
                    </Button>
                    <Button
                      onClick={() => {
                        setUploadedFiles([]);
                        setUploadSessionId("");
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Upload More
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">How it works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 space-y-2">
              <p>✓ Select multiple images at once</p>
              <p>✓ Crop each image individually</p>
              <p>✓ All images are grouped as a bulk upload</p>
              <p>✓ View and manage them together in your documents</p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Crop Modal */}
      {currentImageUrl && currentImageFile && (
        <CropModal
          isOpen={isCropOpen}
          onClose={handleImageSkip}
          imageUrl={currentImageUrl}
          onSave={handleImageSave}
          isDefaultCropNeeded={false}
          onDone={handleCropDone}
        />
      )}
    </div>
  );
}
