"use client"

import { useState } from "react"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  SkipForward,
  AlertCircle,
  FileText,
  Keyboard,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Mock data
const mockLines = [
  {
    id: "1",
    lineNumber: 1,
    imageUrl: "/handwritten-text-line-1.jpg",
    autoText: "In the year of our Lord eighteen hundred and ninety",
    correctedText: "",
    verified: false,
    documentName: "historical-manuscript-1890.pdf",
    pageNumber: 1,
  },
  {
    id: "2",
    lineNumber: 2,
    imageUrl: "/handwritten-text-line-2.jpg",
    autoText: "three, on the fifteenth day of March, at the hour",
    correctedText: "",
    verified: false,
    documentName: "historical-manuscript-1890.pdf",
    pageNumber: 1,
  },
  {
    id: "3",
    lineNumber: 3,
    imageUrl: "/handwritten-text-line-3.jpg",
    autoText: "of ten o'clock in the forenoon, before me personally",
    correctedText: "",
    verified: false,
    documentName: "historical-manuscript-1890.pdf",
    pageNumber: 1,
  },
]

const mockDocuments = [
  { id: "1", name: "historical-manuscript-1890.pdf", totalLines: 1250, verifiedLines: 890 },
  { id: "2", name: "census-records-1920.pdf", totalLines: 3200, verifiedLines: 3200 },
  { id: "3", name: "legal-document-bundle.pdf", totalLines: 2100, verifiedLines: 450 },
]

export default function LabelPage() {
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [lines, setLines] = useState(mockLines)
  const [correctedText, setCorrectedText] = useState(
    lines[currentLineIndex].correctedText || lines[currentLineIndex].autoText,
  )
  const [selectedDocument, setSelectedDocument] = useState("1")
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  const currentLine = lines[currentLineIndex]
  const selectedDoc = mockDocuments.find((d) => d.id === selectedDocument)
  const progress = selectedDoc ? Math.round((selectedDoc.verifiedLines / selectedDoc.totalLines) * 100) : 0

  const handleSave = () => {
    const updatedLines = [...lines]
    updatedLines[currentLineIndex].correctedText = correctedText
    setLines(updatedLines)
  }

  const handleVerify = () => {
    const updatedLines = [...lines]
    updatedLines[currentLineIndex].correctedText = correctedText
    updatedLines[currentLineIndex].verified = true
    setLines(updatedLines)
    goToNextLine()
  }

  const goToPreviousLine = () => {
    if (currentLineIndex > 0) {
      const newIndex = currentLineIndex - 1
      setCurrentLineIndex(newIndex)
      setCorrectedText(lines[newIndex].correctedText || lines[newIndex].autoText)
    }
  }

  const goToNextLine = () => {
    if (currentLineIndex < lines.length - 1) {
      const newIndex = currentLineIndex + 1
      setCurrentLineIndex(newIndex)
      setCorrectedText(lines[newIndex].correctedText || lines[newIndex].autoText)
    }
  }

  const handleSkip = () => {
    goToNextLine()
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Line Labeling</h1>
              <p className="text-muted-foreground">Review and correct extracted text line by line</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-fit bg-transparent"
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
            >
              <Keyboard className="h-4 w-4" />
              Keyboard Shortcuts
            </Button>
          </div>

          {showKeyboardShortcuts && (
            <Alert>
              <Keyboard className="h-4 w-4" />
              <AlertDescription>
                <div className="grid gap-2 text-sm mt-2">
                  <div className="flex justify-between">
                    <span className="font-mono">Ctrl + S</span>
                    <span>Save correction</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono">Ctrl + Enter</span>
                    <span>Verify line</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono">Ctrl + →</span>
                    <span>Next line</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono">Ctrl + ←</span>
                    <span>Previous line</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Document Selection */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle>Select Document</CardTitle>
                  <CardDescription>Choose a document to start labeling</CardDescription>
                </div>
                <Select value={selectedDocument} onValueChange={setSelectedDocument}>
                  <SelectTrigger className="w-full md:w-80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDocuments.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            {selectedDoc && (
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Document Progress</span>
                    <span className="font-medium">
                      {selectedDoc.verifiedLines.toLocaleString()} / {selectedDoc.totalLines.toLocaleString()} lines (
                      {progress}%)
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Line Labeling Interface */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>
                      Line {currentLine.lineNumber} of {lines.length}
                    </CardTitle>
                    {currentLine.verified ? (
                      <Badge className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="gap-1" variant="secondary">
                        <AlertCircle className="h-3 w-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    {currentLine.documentName} - Page {currentLine.pageNumber}
                  </CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Line Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Line Image</label>
                <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-center">
                  <img
                    src={currentLine.imageUrl || "/placeholder.svg"}
                    alt={`Line ${currentLine.lineNumber}`}
                    className="max-h-24 w-auto"
                  />
                </div>
              </div>

              {/* Auto-detected Text */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto-detected Text</label>
                <div className="rounded-lg border bg-secondary/50 p-4">
                  <p className="text-sm font-mono leading-relaxed">
                    {currentLine.autoText || <span className="text-muted-foreground italic">No text detected</span>}
                  </p>
                </div>
              </div>

              {/* Corrected Text Input */}
              <div className="space-y-2">
                <label htmlFor="corrected-text" className="text-sm font-medium">
                  Corrected Text
                </label>
                <Textarea
                  id="corrected-text"
                  value={correctedText}
                  onChange={(e) => setCorrectedText(e.target.value)}
                  placeholder="Enter or correct the text from the image..."
                  className="min-h-24 font-mono text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleSave} variant="outline" className="gap-2 flex-1 bg-transparent">
                  <Save className="h-4 w-4" />
                  Save Correction
                </Button>
                <Button onClick={handleVerify} className="gap-2 flex-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Verify & Next
                </Button>
                <Button onClick={handleSkip} variant="outline" className="gap-2 bg-transparent">
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  onClick={goToPreviousLine}
                  disabled={currentLineIndex === 0}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Line
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentLineIndex + 1} of {lines.length}
                </span>
                <Button
                  onClick={goToNextLine}
                  disabled={currentLineIndex === lines.length - 1}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  Next Line
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
