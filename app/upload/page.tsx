"use client"

import type React from "react"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const pdfFiles = files.filter((file) => file.type === "application/pdf")
    if (pdfFiles.length > 0) {
      simulateUpload(pdfFiles)
    }
  }

  const simulateUpload = (files: File[]) => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadedFiles((current) => [...current, ...files.map((f) => f.name)])
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Upload Documents</h1>
            <p className="text-muted-foreground">Upload PDF documents to begin the annotation process</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Files</CardTitle>
              <CardDescription>Drag and drop or click to select PDF files for processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors",
                  isDragging ? "border-primary bg-primary/5" : "border-border",
                  !isUploading && "cursor-pointer hover:border-primary hover:bg-accent",
                )}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="sr-only"
                  accept=".pdf"
                  multiple
                  onChange={handleFileInput}
                  disabled={isUploading}
                />
                <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                  ) : (
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  )}
                  <p className="text-lg font-medium mb-2">
                    {isUploading ? "Uploading..." : "Drop PDF files here or click to browse"}
                  </p>
                  <p className="text-sm text-muted-foreground">Supports multiple PDF files</p>
                </label>

                {isUploading && (
                  <div className="w-full max-w-sm mt-6">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-center text-sm text-muted-foreground mt-2">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files</CardTitle>
                <CardDescription>{uploadedFiles.length} files uploaded successfully</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="flex-1 text-sm font-medium">{fileName}</span>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
