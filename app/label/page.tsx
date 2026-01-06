"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  SkipForward,
  AlertCircle,
  FileText,
  Keyboard,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  extractTextForDocument,
  listDocumentLines,
  listDocuments,
  extractTextFromLine,
  saveCorrectedText,
  verifyLine,
} from "@/lib/documents-api";
import { showToast } from "@/lib/toast";
import { DocumentResponse, LineResponse } from "@/types/documents";

export default function LabelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lines, setLines] = useState<LineResponse[]>([]);
  const [correctedText, setCorrectedText] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoadingLines, setIsLoadingLines] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [isExtractingLineText, setIsExtractingLineText] = useState(false);
  const initializedFromUrl = useRef(false);

  const currentLine = lines[currentLineIndex];

  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedDocument) || null,
    [documents, selectedDocument]
  );

  const progress = useMemo(() => {
    if (lines.length === 0) return 0;
    const verifiedCount = lines.filter((l) => l.verified).length;
    return Math.round((verifiedCount / lines.length) * 100);
  }, [lines]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await listDocuments();
        setDocuments(data);
        if (data.length > 0) {
          const docFromQuery = searchParams.get("doc");
          const matchedDoc = data.find((d) => d.id === docFromQuery);
          setSelectedDocument((prev) => prev || matchedDoc?.id || data[0].id);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load documents";
        showToast({ message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [searchParams]);

  // Load lines for selected document
  useEffect(() => {
    const loadLines = async () => {
      if (!selectedDocument) return;
      initializedFromUrl.current = false;
      setIsLoadingLines(true);
      try {
        const data = await listDocumentLines(selectedDocument);
        setLines(data);
        const lineParam = searchParams.get("line");
        const requestedIndex = lineParam ? parseInt(lineParam, 10) : 0;
        const safeIndex = Number.isNaN(requestedIndex)
          ? 0
          : Math.min(Math.max(requestedIndex, 0), Math.max(data.length - 1, 0));
        setCurrentLineIndex(safeIndex);
        const activeLine = data[safeIndex];
        setCorrectedText(
          activeLine?.corrected_text || activeLine?.auto_text || ""
        );
        initializedFromUrl.current = true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load lines";
        showToast({ message, variant: "error" });
      } finally {
        setIsLoadingLines(false);
      }
    };
    loadLines();
  }, [searchParams, selectedDocument]);

  // Keep URL query in sync with current document and line for reload/deep-link
  useEffect(() => {
    if (!selectedDocument || !initializedFromUrl.current) return;
    const docParam = searchParams.get("doc") || "";
    const lineParam = searchParams.get("line") || "";
    const nextLine = String(currentLineIndex);

    let changed = false;
    const params = new URLSearchParams(searchParams.toString());
    if (docParam !== selectedDocument) {
      params.set("doc", selectedDocument);
      changed = true;
    }
    if (lineParam !== nextLine) {
      params.set("line", nextLine);
      changed = true;
    }

    if (changed) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [currentLineIndex, router, searchParams, selectedDocument]);

  // Sync corrected text when current line changes
  useEffect(() => {
    if (!currentLine) {
      setCorrectedText("");
      return;
    }
    setCorrectedText(currentLine.corrected_text || currentLine.auto_text || "");
  }, [currentLineIndex, currentLine]);

  const handleSave = async () => {
    if (!currentLine) return;
    setIsExtractingText(true);
    try {
      await saveCorrectedText(currentLine.id, correctedText);
      const updatedLines = [...lines];
      updatedLines[currentLineIndex] = {
        ...updatedLines[currentLineIndex],
        corrected_text: correctedText,
      };
      setLines(updatedLines);
      showToast({
        message: "✅ Correction saved",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save correction";
      showToast({ message, variant: "error" });
    } finally {
      setIsExtractingText(false);
    }
  };

  const handleVerify = async () => {
    if (!currentLine) return;
    setIsExtractingText(true);
    try {
      await verifyLine(currentLine.id);
      const updatedLines = [...lines];
      updatedLines[currentLineIndex] = {
        ...updatedLines[currentLineIndex],
        corrected_text: correctedText,
        verified: true,
      };
      setLines(updatedLines);
      showToast({
        message: "✅ Line verified",
        variant: "success",
      });
      goToNextLine();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to verify line";
      showToast({ message, variant: "error" });
    } finally {
      setIsExtractingText(false);
    }
  };

  const goToPreviousLine = () => {
    if (currentLineIndex > 0) {
      const newIndex = currentLineIndex - 1;
      setCurrentLineIndex(newIndex);
    }
  };

  const goToNextLine = () => {
    if (currentLineIndex < lines.length - 1) {
      const newIndex = currentLineIndex + 1;
      setCurrentLineIndex(newIndex);
    }
  };

  const handleSkip = () => {
    goToNextLine();
  };

  const handleExtractText = async () => {
    if (!selectedDocument) return;
    setIsExtractingText(true);
    try {
      await extractTextForDocument(selectedDocument);
      showToast({ message: "Text extraction started", variant: "success" });
      // Refresh lines to get updated auto_text
      const refreshed = await listDocumentLines(selectedDocument);
      setLines(refreshed);
      setCurrentLineIndex(0);
      const firstLine = refreshed[0];
      setCorrectedText(firstLine?.corrected_text || firstLine?.auto_text || "");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to extract text";
      showToast({ message, variant: "error" });
    } finally {
      setIsExtractingText(false);
    }
  };

  const handleExtractLineText = async () => {
    if (!currentLine) return;
    setIsExtractingLineText(true);
    try {
      const result = await extractTextFromLine(currentLine.id);
      // Update the current line with extracted text
      const updatedLines = [...lines];
      updatedLines[currentLineIndex] = {
        ...updatedLines[currentLineIndex],
        auto_text: result.extracted_text,
      };
      setLines(updatedLines);
      setCorrectedText(result.extracted_text || "");
      showToast({
        message: "✅ Text extracted for this line",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to extract line text";
      showToast({ message, variant: "error" });
    } finally {
      setIsExtractingLineText(false);
    }
  };

  const renderProgressContent = () => {
    if (isLoadingLines) {
      return (
        <div className="text-sm text-muted-foreground">Loading lines...</div>
      );
    }
    if (lines.length === 0) {
      return (
        <div className="text-sm text-muted-foreground">
          No lines available. Convert pages and extract lines first.
        </div>
      );
    }

    const verifiedCount = lines.filter((l) => l.verified).length;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Document Progress</span>
          <span className="font-medium">
            {verifiedCount.toLocaleString()} / {lines.length.toLocaleString()}{" "}
            lines ({progress}%)
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  };

  const renderLineContent = () => {
    if (isLoadingLines) {
      return (
        <div className="text-sm text-muted-foreground">Loading lines...</div>
      );
    }
    if (!currentLine) {
      return (
        <div className="text-sm text-muted-foreground">
          No lines available. Convert pages and extract lines first.
        </div>
      );
    }

    return (
      <>
        <div className="space-y-2">
          <p className="text-sm font-medium">Line Image</p>
          <div className="rounded-lg border bg-muted/30 p-4 flex items-center justify-center">
            <img
              src={currentLine.image_path || "/placeholder.svg"}
              alt={`Line ${currentLineIndex + 1}`}
              className="max-h-24 w-auto"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Auto-detected Text</p>
            <Button
              onClick={handleExtractLineText}
              variant="ghost"
              size="sm"
              disabled={!currentLine || isExtractingLineText}
              className="gap-2 h-8"
            >
              {isExtractingLineText ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Extracting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Extract Text
                </>
              )}
            </Button>
          </div>
          <div className="rounded-lg border bg-secondary/50 p-4">
            <p className="text-sm font-mono leading-relaxed">
              {currentLine.auto_text || (
                <span className="text-muted-foreground italic">
                  No text detected
                </span>
              )}
            </p>
          </div>
        </div>

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

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleSave}
            variant="outline"
            className="gap-2 flex-1 bg-transparent"
            disabled={!currentLine || isExtractingText}
          >
            {isExtractingText ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Correction
              </>
            )}
          </Button>
          <Button
            onClick={handleVerify}
            className="gap-2 flex-1"
            disabled={!currentLine || isExtractingText || currentLine.verified}
          >
            {isExtractingText ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </>
            ) : currentLine?.verified ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Verified
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Verify & Next
              </>
            )}
          </Button>
          <Button
            onClick={handleSkip}
            variant="outline"
            className="gap-2 bg-transparent"
            disabled={!currentLine}
          >
            <SkipForward className="h-4 w-4" />
            Skip
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Line Labeling</h1>
              <p className="text-muted-foreground">
                Review and correct extracted text line by line
              </p>
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
                  <CardDescription>
                    Choose a document to start labeling
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <Select
                    value={selectedDocument}
                    onValueChange={setSelectedDocument}
                    disabled={documents.length === 0 || isLoading}
                  >
                    <SelectTrigger className="w-full md:w-80">
                      <span className="flex-1 truncate text-left">
                        <SelectValue placeholder="Select a document" />
                      </span>
                    </SelectTrigger>

                    <SelectContent className="max-h-72">
                      {documents.length === 0 ? (
                        <SelectItem value="no-docs" disabled>
                          No documents available
                        </SelectItem>
                      ) : (
                        documents.map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            <span className="block truncate max-w-[80vw] md:max-w-72">
                              {doc.original_filename || "Untitled"}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                    disabled={
                      !selectedDocument || isLoadingLines || isExtractingText
                    }
                    onClick={handleExtractText}
                  >
                    {isExtractingText ? "Extracting..." : "Extract Text"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {selectedDocument && (
              <CardContent>{renderProgressContent()}</CardContent>
            )}
          </Card>

          {/* Line Labeling Interface */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>
                      {currentLine
                        ? `Line ${currentLineIndex + 1} of ${
                            lines.length
                          } • Page ${currentLine.page_number}`
                        : "No line selected"}
                    </CardTitle>
                    {currentLine &&
                      (currentLine.verified ? (
                        <Badge className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="gap-1" variant="secondary">
                          <AlertCircle className="h-3 w-3" />
                          Unverified
                        </Badge>
                      ))}
                  </div>
                  <CardDescription>
                    {selectedDoc?.original_filename || "Select a document"}
                  </CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderLineContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  onClick={goToPreviousLine}
                  disabled={currentLineIndex === 0 || lines.length === 0}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous Line</span>
                </Button>

                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {lines.length === 0
                    ? "0 of 0"
                    : `${currentLineIndex + 1} of ${lines.length}`}
                </span>

                <Button
                  onClick={goToNextLine}
                  disabled={
                    lines.length === 0 || currentLineIndex === lines.length - 1
                  }
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <span className="hidden sm:inline">Next Line</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
