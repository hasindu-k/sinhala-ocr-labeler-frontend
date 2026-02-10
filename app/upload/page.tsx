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
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadDocuments } from "@/lib/documents-api";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { CropModal } from "@/components/crop-modal";

interface UploadedFile {
  name: string;
  isBulk: boolean;
  uploadSessionId: string;
}

function renameToPng(name: string) {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? `${name.substring(0, idx)}.png` : `${name}.png`;
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadSessionId, setUploadSessionId] = useState<string>("");
  const [isBulkUpload, setIsBulkUpload] = useState(false);
  const router = useRouter();

  // Image cropping flow
  const [imageQueue, setImageQueue] = useState<File[]>([]); // raw images
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Tracks multiple crops for current raw image
  const [currentCrops, setCurrentCrops] = useState<Blob[]>([]);

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
      (file) => file.type === "application/pdf" || file.name.endsWith(".pdf"),
    );
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (pdfFiles.length === 0 && imageFiles.length === 0) {
      showToast({
        message: "Please select PDF or image files",
        variant: "error",
      });
      return;
    }

    // Generate session ID and check if bulk upload
    const sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const isBulk = imageFiles.length > 1;

    setUploadSessionId(sessionId);
    setIsBulkUpload(isBulk);
    setIsUploading(true);
    setUploadProgress(0);
    setProcessedCount(0);
    setTotalCount(pdfFiles.length + imageFiles.length);

    try {
      // 1️⃣ Upload PDFs in batch
      if (pdfFiles.length > 0) {
        try {
          const docs = await uploadDocuments(pdfFiles);
          docs.forEach((doc, index) => {
            setUploadedFiles((current) => [
              ...current,
              {
                name: doc.original_filename || pdfFiles[index].name,
                isBulk: pdfFiles.length > 1,
                uploadSessionId: sessionId,
              },
            ]);
          });
          showToast({
            message: `${pdfFiles.length} PDF(s) uploaded`,
            variant: "success",
          });
        } catch {
          showToast({
            message: "PDF upload failed",
            variant: "error",
          });
        } finally {
          setProcessedCount((prev) => {
            const next = prev + pdfFiles.length;
            setUploadProgress(Math.round((next / totalCount) * 100));
            return next;
          });
        }
      }

      // 2️⃣ Queue images for cropping
      if (imageFiles.length > 0) {
        setImageQueue(imageFiles);
        openNextImage(imageFiles[0]);
      } else {
        finalizeUpload();
      }
    } finally {
      // Images will continue processing in modal
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
    setCurrentCrops([]); // reset crops for this raw image
  };

  const closeCropModal = () => {
    if (currentImageUrl) URL.revokeObjectURL(currentImageUrl);
    setIsCropOpen(false);
    setCurrentImageUrl(null);
    setCurrentImageFile(null);
  };

  // 3️⃣ Upload **cropped image**
  const handleImageSave = async (newImage: Blob) => {
    if (!currentImageFile) return;

    try {
      const croppedFile = new File(
        [newImage],
        renameToPng(currentImageFile.name),
        { type: "image/png" },
      );

      const [doc] = await uploadDocuments([croppedFile]);

      setUploadedFiles((current) => [
        ...current,
        {
          name: doc.original_filename || croppedFile.name,
          isBulk: isBulkUpload,
          uploadSessionId: uploadSessionId,
        },
      ]);

      showToast({
        message: `${croppedFile.name} uploaded`,
        variant: "success",
      });

      setCurrentCrops((prev) => [...prev, newImage]); // keep track of multiple crops
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      showToast({
        message: `${currentImageFile.name}: ${message}`,
        variant: "error",
      });
    }
  };

  // 4️⃣ Finish cropping for current raw image
  const handleCropDone = () => {
    const [_, ...rest] = imageQueue;
    setImageQueue(rest);
    closeCropModal();
    openNextImage(rest[0]);
    setProcessedCount((prev) => {
      const nextProcessed = prev + 1;
      setUploadProgress(Math.round((nextProcessed / totalCount) * 100));
      return nextProcessed;
    });
    setCurrentCrops([]);
  };

  // Skip button → finish cropping without adding more crops
  const handleImageSkip = () => {
    handleCropDone();
  };

  const finalizeUpload = () => {
    setTimeout(() => router.push("/documents"), 1000);
    setIsUploading(false);
    setImageQueue([]);
    setCurrentImageFile(null);
    setCurrentImageUrl(null);
    setIsCropOpen(false);
    setProcessedCount(0);
    setTotalCount(0);
    setIsBulkUpload(false);
    setUploadSessionId("");
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Upload Documents</h1>
              <p className="text-muted-foreground">
                Upload PDFs and crop images (multiple crops per image)
              </p>
            </div>
            <Button
              onClick={() => router.push("/upload/bulk")}
              variant="outline"
              className="whitespace-nowrap"
            >
              Bulk Upload Images →
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag & drop or click to select PDF or image files
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
                    "cursor-pointer hover:border-primary hover:bg-accent",
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
                    Supports multiple PDFs and images with multiple crops
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
                  {uploadedFiles.map((file) => (
                    <div
                      key={`${file.uploadSessionId}-${file.name}`}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                    >
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{file.name}</p>
                        {file.isBulk && (
                          <p className="text-xs text-muted-foreground mt-1">
                            → Bulk Upload
                          </p>
                        )}
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
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
          onDone={handleCropDone} // optional "Finish" button to stop cropping this raw image
        />
      )}
    </div>
  );
}
