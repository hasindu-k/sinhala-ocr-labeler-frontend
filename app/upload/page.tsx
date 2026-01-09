"use client";

import type React from "react";

import { useState } from "react";
import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadDocument } from "@/lib/documents-api";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { CropModal } from "@/components/crop-modal";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const router = useRouter();

  // Image cropping flow state
  const [imageQueue, setImageQueue] = useState<File[]>([]);
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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

    const pdfFiles = files.filter(
      (file) => file.type === "application/pdf" || file.name.endsWith(".pdf")
    );
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (pdfFiles.length === 0 && imageFiles.length === 0) {
      showToast({
        message: "Please select PDF or image files",
        variant: "error",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setProcessedCount(0);
    setTotalCount(pdfFiles.length + imageFiles.length);

    try {
      // 1) Process PDFs as-is
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        try {
          const doc = await uploadDocument(file);
          setUploadedFiles((current) => [
            ...current,
            doc.original_filename || file.name,
          ]);
          showToast({ message: `${file.name} uploaded`, variant: "success" });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Upload failed";
          showToast({ message: `${file.name}: ${message}`, variant: "error" });
        } finally {
          setProcessedCount((prev) => {
            const nextProcessed = prev + 1;
            setUploadProgress(Math.round((nextProcessed / totalCount) * 100));
            return nextProcessed;
          });
        }
      }

      // 2) Queue images for cropping and upload one-by-one
      if (imageFiles.length > 0) {
        setImageQueue(imageFiles);
        openNextImage(imageFiles[0]);
      } else {
        // No images, finalize
        finalizeUpload();
      }
    } finally {
      // Do not finalize here; images may still be processing via modal
    }
  };

  const openNextImage = (file: File | undefined) => {
    if (!file) {
      finalizeUpload();
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

  const handleImageSave = async (newImage: Blob) => {
    if (!currentImageFile) return;
    try {
      const croppedFile = new File(
        [newImage],
        renameToPng(currentImageFile.name),
        {
          type: "image/png",
        }
      );
      const doc = await uploadDocument(croppedFile);
      setUploadedFiles((current) => [
        ...current,
        doc.original_filename || croppedFile.name,
      ]);
      showToast({
        message: `${croppedFile.name} uploaded`,
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      showToast({
        message: `${currentImageFile.name}: ${message}`,
        variant: "error",
      });
    } finally {
      setProcessedCount((prev) => {
        const nextProcessed = prev + 1;
        setUploadProgress(Math.round((nextProcessed / totalCount) * 100));
        return nextProcessed;
      });

      // Move to next image in queue
      const [_, ...rest] = imageQueue;
      setImageQueue(rest);
      closeCropModal();
      openNextImage(rest[0]);
    }
  };

  const handleImageSkip = async () => {
    // If user cancels, upload original image without cropping
    if (!currentImageFile) {
      closeCropModal();
      return;
    }
    try {
      const doc = await uploadDocument(currentImageFile);
      setUploadedFiles((current) => [
        ...current,
        doc.original_filename || currentImageFile.name,
      ]);
      showToast({
        message: `${currentImageFile.name} uploaded`,
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      showToast({
        message: `${currentImageFile.name}: ${message}`,
        variant: "error",
      });
    } finally {
      setProcessedCount((prev) => {
        const nextProcessed = prev + 1;
        setUploadProgress(Math.round((nextProcessed / totalCount) * 100));
        return nextProcessed;
      });

      // Move to next image in queue
      const [_, ...rest] = imageQueue;
      setImageQueue(rest);
      closeCropModal();
      openNextImage(rest[0]);
    }
  };

  function renameToPng(name: string) {
    const idx = name.lastIndexOf(".");
    return idx > 0 ? `${name.substring(0, idx)}.png` : `${name}.png`;
  }

  const finalizeUpload = () => {
    // Navigate to documents after a short delay and reset state
    setTimeout(() => {
      router.push("/documents");
    }, 1000);
    setIsUploading(false);
    setImageQueue([]);
    setCurrentImageFile(null);
    setCurrentImageUrl(null);
    setIsCropOpen(false);
    setProcessedCount(0);
    setTotalCount(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Upload Documents</h1>
            <p className="text-muted-foreground">
              Upload PDF documents to begin the annotation process
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Files</CardTitle>
              <CardDescription>
                Drag and drop or click to select PDF files for processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                  !isUploading &&
                    "cursor-pointer hover:border-primary hover:bg-accent"
                )}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="sr-only"
                  accept=".pdf,image/*"
                  multiple
                  onChange={handleFileInput}
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  )}
                  <p className="text-lg font-medium mb-2">
                    {isUploading
                      ? "Uploading..."
                      : "Drop PDF or image files here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports multiple PDF and image files
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
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>
                  {uploadedFiles.length} files uploaded successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((fileName, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm font-medium">
                        {fileName}
                      </span>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Image Crop Modal */}
      {currentImageUrl && (
        <CropModal
          isOpen={isCropOpen}
          onClose={handleImageSkip}
          imageUrl={currentImageUrl}
          onSave={handleImageSave}
        />
      )}
    </div>
  );
}
