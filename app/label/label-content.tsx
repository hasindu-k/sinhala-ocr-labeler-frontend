"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NavHeader } from "@/components/nav-header";
import { ReactTransliterate } from "react-transliterate";
import "react-transliterate/dist/index.css";
import { useAuth } from "@/lib/auth-context";

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
  Eye,
  EyeOff,
  ListTodo,
  Ban,
  RotateCcw,
  ZoomIn,
  ZoomOut,
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
  createFinalizedDataset,
  invalidateLine,
  restoreLine,
} from "@/lib/documents-api";
import { showToast } from "@/lib/toast";
import { DocumentResponse, LineResponse } from "@/types/documents";

export function LabelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
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
  const [isCreatingDataset, setIsCreatingDataset] = useState(false);
  const [showAutoText, setShowAutoText] = useState(false);
  const [isUpdatingInvalidState, setIsUpdatingInvalidState] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initializedFromUrl = useRef(false);

  const currentLine = lines[currentLineIndex];

  useEffect(() => {
    // Reset zoom when line changes
    setImageZoom(1);

    // Focus text area slightly after render to ensure content is ready if not verified
    const timer = setTimeout(() => {
      if (!currentLine?.verified && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentLineIndex]);

  const selectedDoc = useMemo(
    () => documents.find((d) => d.id === selectedDocument) || null,
    [documents, selectedDocument]
  );

  const allLinesVerified = useMemo(
    () => lines.length > 0 && lines.every((line) => line.verified),
    [lines]
  );

  const jumpToNextUnverified = () => {
    if (lines.length === 0) return;

    // 1. Search forward from current line
    let nextIndex = lines.findIndex(
      (l, index) => index > currentLineIndex && !l.verified
    );

    if (nextIndex === -1) {
      nextIndex = lines.findIndex((l) => !l.verified);
    }

    if (nextIndex !== -1) {
      setCurrentLineIndex(nextIndex);
    } else {
      showToast({ message: "All lines are verified! 🎉", variant: "success" });
    }
  };

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
          if (!docFromQuery) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("doc", matchedDoc?.id || data[0].id);
            router.replace(`?${params.toString()}`, { scroll: false });
          }
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

  useEffect(() => {
    const loadLines = async () => {
      if (!selectedDocument) return;
      initializedFromUrl.current = false;
      setIsLoadingLines(true);
      try {
        const data = await listDocumentLines(selectedDocument);
        setLines(data);
        const lineParam = searchParams.get("line");
        const requestedIndex = lineParam ? Number.parseInt(lineParam, 10) : 0;
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

  useEffect(() => {
    if (!selectedDocument) return;
    const docParam = searchParams.get("doc") || "";
    const lineParam = searchParams.get("line") || "";
    const nextLine = String(currentLineIndex);

    let changed = false;
    const params = new URLSearchParams(searchParams.toString());
    if (docParam !== selectedDocument) {
      params.set("doc", selectedDocument);
      changed = true;
    }
    if (initializedFromUrl.current && lineParam !== nextLine) {
      params.set("line", nextLine);
      changed = true;
    }

    if (changed) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [currentLineIndex, router, searchParams, selectedDocument]);

  useEffect(() => {
    if (!currentLine) {
      setCorrectedText("");
      return;
    }
    setCorrectedText(currentLine.corrected_text || currentLine.auto_text || "");
  }, [currentLineIndex, currentLine]);

  const handleSave = async () => {
    if (!currentLine) return;
    if (currentLine.is_invalid) {
      showToast({
        message: "Line is marked invalid. Restore before saving.",
        variant: "error",
      });
      return;
    }
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
    if (currentLine.is_invalid) {
      showToast({
        message: "Line is marked invalid. Restore before verifying.",
        variant: "error",
      });
      return;
    }
    setIsExtractingText(true);
    try {
      await verifyLine(currentLine.id, correctedText);
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
    if (currentLine.is_invalid) {
      showToast({
        message: "Line is marked invalid. Restore before extracting.",
        variant: "error",
      });
      return;
    }
    setIsExtractingLineText(true);
    try {
      const result = await extractTextFromLine(currentLine.id);
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

  const handleInvalidateLine = async () => {
    if (!currentLine) return;
    setIsUpdatingInvalidState(true);
    try {
      await invalidateLine(currentLine.id);
      setLines((prev) => {
        const updated = [...prev];
        updated[currentLineIndex] = {
          ...updated[currentLineIndex],
          is_invalid: true,
        } as LineResponse;
        return updated;
      });
      showToast({ message: "Line marked invalid", variant: "success" });
      goToNextLine();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to invalidate line";
      showToast({ message, variant: "error" });
    } finally {
      setIsUpdatingInvalidState(false);
    }
  };

  const handleRestoreLine = async () => {
    if (!currentLine) return;
    setIsUpdatingInvalidState(true);
    try {
      await restoreLine(currentLine.id);
      setLines((prev) => {
        const updated = [...prev];
        updated[currentLineIndex] = {
          ...updated[currentLineIndex],
          is_invalid: false,
        } as LineResponse;
        return updated;
      });
      showToast({ message: "Line restored", variant: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to restore line";
      showToast({ message, variant: "error" });
    } finally {
      setIsUpdatingInvalidState(false);
    }
  };

  const handleCreateFinalizedDataset = async () => {
    if (!selectedDocument || !allLinesVerified) return;
    setIsCreatingDataset(true);
    try {
      const result = await createFinalizedDataset(selectedDocument);
      const datasetName = result?.dataset_name || "dataset";
      showToast({
        message: `✅ Finalized dataset created: ${datasetName}`,
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create finalized dataset";
      showToast({ message, variant: "error" });
    } finally {
      setIsCreatingDataset(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;

      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        handleSave();
        return;
      }

      if (event.key === "Enter" && user?.role === "admin") {
        event.preventDefault();
        handleVerify();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleVerify, user?.role]);

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
        {allLinesVerified && (
          <div className="pt-2">
            <Button
              onClick={handleCreateFinalizedDataset}
              disabled={isCreatingDataset}
              className="w-full sm:w-auto gap-2"
            >
              {isCreatingDataset ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating dataset...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Create Finalized Dataset
                </>
              )}
            </Button>
          </div>
        )}
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between pb-2">
            {/* Left: Title & Status Badge */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Line Image
              </p>
              {currentLine.is_invalid && (
                <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                  <Ban className="h-3 w-3" /> Invalid
                </span>
              )}
            </div>

            {/* Right: Toolbar Actions */}
            <div className="flex items-center gap-3">
              {/* 1. Zoom Control Group (Segmented Style) */}
              <div className="flex items-center rounded-md border shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none rounded-l-md border-r hover:bg-muted"
                  onClick={() => setImageZoom((z) => Math.max(1, z - 0.5))}
                  disabled={imageZoom <= 1}
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <div className="w-12 bg-muted/20 text-center text-xs font-medium leading-7 tabular-nums">
                  {imageZoom}x
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none rounded-r-md border-l hover:bg-muted"
                  onClick={() => setImageZoom((z) => Math.min(4, z + 0.5))}
                  disabled={imageZoom >= 4}
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* 2. Invalidate / Restore Action */}
              {currentLine.is_invalid ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 border-dashed text-xs hover:bg-muted"
                  onClick={handleRestoreLine}
                  disabled={isUpdatingInvalidState}
                >
                  {isUpdatingInvalidState ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Restore
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleInvalidateLine}
                  disabled={isUpdatingInvalidState}
                >
                  {isUpdatingInvalidState ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Ban className="h-3.5 w-3.5" />
                  )}
                  Invalidate
                </Button>
              )}
            </div>
          </div>

          <div className="relative rounded-lg border bg-muted/30 h-48 flex items-center justify-center overflow-hidden">
            <div
              className="overflow-auto w-full h-full flex items-center justify-center"
              style={{ cursor: imageZoom > 1 ? "grab" : "default" }}
            >
              <img
                src={
                  currentLine.image_url ||
                  currentLine.image_path ||
                  "/placeholder.svg"
                }
                alt="Line"
                style={{
                  transform: `scale(${imageZoom})`,
                  transition: "transform 0.2s ease-out",
                }}
                className="max-h-full w-auto object-contain"
              />
            </div>
          </div>

          {currentLine.is_invalid && (
            <Badge variant="destructive" className="w-fit gap-1 mt-2">
              <AlertCircle className="h-3 w-3" /> Invalid crop
            </Badge>
          )}
        </div>

        {currentLine.is_invalid && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This line is marked as an invalid crop. Restore it to continue
              labeling or verify a different line.
            </AlertDescription>
          </Alert>
        )}

        {showAutoText && (
          <div className="rounded-md border bg-secondary/30 p-3 text-xs font-mono text-muted-foreground">
            <span className="font-bold mr-2">Auto:</span>
            {currentLine?.auto_text || "No text detected"}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="corrected-text" className="text-sm font-medium">
              Corrected Text
            </label>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAutoText((prev) => !prev)}
                variant="ghost"
                size="sm"
                className="gap-2 h-8"
              >
                {showAutoText ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Auto Text
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Auto Text
                  </>
                )}
              </Button>
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
          </div>
          <div className="flex-1 min-h-[120px]">
            <ReactTransliterate
              renderComponent={(props) => (
                <Textarea
                  {...props}
                  // CORRECTED REF LOGIC BELOW
                  id="corrected-text"
                  placeholder="Enter or correct the text from the image..."
                  ref={(element) => {
                    // 1. Assign to your local ref (for auto-focus)
                    textareaRef.current = element;

                    // 2. Safely assign to the library's ref
                    // The library might pass a callback OR an object ref
                    if (props.ref) {
                      if (typeof props.ref === "function") {
                        props.ref(element);
                      } else {
                        // It's an object ref, so we assign to .current
                        // @ts-ignore
                        props.ref.current = element;
                      }
                    }
                  }}
                  className="h-full font-mono text-lg resize-none"
                  disabled={!!currentLine?.is_invalid}
                />
              )}
              value={correctedText}
              onChangeText={(text) => setCorrectedText(text)}
              lang="si"
              containerStyles={{ height: "100%" }} // Ensure container takes full height
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {user?.role === "admin" ? (
            <Button
              onClick={handleVerify}
              className="gap-2 flex-1"
              disabled={
                !currentLine || isExtractingText || !!currentLine?.is_invalid
              }
            >
              {isExtractingText ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verify Line
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSave}
                variant="outline"
                className="gap-2 flex-1 bg-transparent"
                disabled={
                  !currentLine || isExtractingText || !!currentLine?.is_invalid
                }
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
                onClick={handleSkip}
                variant="outline"
                className="gap-2 bg-transparent"
                disabled={!currentLine}
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
            </>
          )}
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-10">
                    <span className="text-sm text-muted-foreground">
                      Save correction
                    </span>
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                      Ctrl + S
                    </code>
                  </div>
                  <div className="flex items-center justify-between gap-10">
                    <span className="text-sm text-muted-foreground">
                      Verify line
                    </span>
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                      Ctrl + Enter
                    </code>
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
                  <div className="flex items-center gap-2">
                    <CardTitle>Select Document</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 px-2 text-xs text-muted-foreground hover:text-primary"
                      onClick={jumpToNextUnverified}
                      disabled={lines.length === 0}
                      title="Jump to next unverified line"
                    >
                      <ListTodo className="h-3.5 w-3.5" />
                      Next Unverified
                    </Button>
                  </div>
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
            <div className="flex items-center justify-between px-4">
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
        </div>
      </main>
    </div>
  );
}
