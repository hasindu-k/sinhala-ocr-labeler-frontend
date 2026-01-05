"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  listDocuments,
  deleteDocument,
  convertDocumentPages,
} from "@/lib/documents-api";
import type { DocumentResponse } from "@/types/documents";
import { showToast } from "@/lib/toast";

// --- Shared Helper Functions ---

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const getVerificationProgress = (verified?: number, extracted?: number) => {
  const total = extracted ?? 0;
  const done = verified ?? 0;
  if (total === 0) return 0;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
};

const getStatusBadge = (status: string) => {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
    case "processed":
    case "completed":
      return (
        <Badge className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          {status}
        </Badge>
      );
    case "processing":
    case "in-progress":
      return (
        <Badge className="gap-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400">
          <AlertCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    case "uploaded":
      return (
        <Badge className="gap-1 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300">
          <AlertCircle className="h-3 w-3" />
          Uploaded
        </Badge>
      );
    case "failed":
      return (
        <Badge className="gap-1 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge className="gap-1" variant="secondary">
          <AlertCircle className="h-3 w-3" />
          {status || "pending"}
        </Badge>
      );
  }
};

// --- Extracted Component ---

interface DocumentListProps {
  isLoading: boolean;
  documents: DocumentResponse[];
  onSelectDocument: (doc: DocumentResponse) => void;
  onSelectConvertPages: (id: string) => void;
  onDelete: (id: string) => void;
}

function DocumentList({
  isLoading,
  documents,
  onSelectDocument,
  onSelectConvertPages,
  onDelete,
}: Readonly<DocumentListProps>) {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Loading documents...
      </div>
    );
  }

  // 2. Empty State
  if (documents.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No documents found.
      </div>
    );
  }

  // 3. List State
  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="rounded-lg border p-3 sm:p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border bg-card">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate text-sm sm:text-base">
                    {doc.original_filename || "Untitled"}
                  </h3>
                  {getStatusBadge(doc.status)}
                </div>

                <div className="flex flex-wrap gap-y-1 gap-x-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span>{doc.total_pages ?? 0} pages</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Uploaded {formatDate(doc.created_at)}</span>
                  {doc.updated_at ? (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>Updated {formatDate(doc.updated_at)}</span>
                    </>
                  ) : null}
                </div>

                {(doc.lines_extracted ?? 0) > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Verification Progress
                      </span>
                      <span className="font-medium">
                        {getVerificationProgress(
                          doc.lines_verified,
                          doc.lines_extracted
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={getVerificationProgress(
                        doc.lines_verified,
                        doc.lines_extracted
                      )}
                      className="h-1.5"
                    />
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        Extracted: {(doc.lines_extracted ?? 0).toLocaleString()}
                      </span>
                      <span>
                        Verified: {(doc.lines_verified ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Area */}
            <div className="flex items-center gap-2">
              {/* DESKTOP ONLY: Visible Button */}
              <Button
                variant="outline"
                size="sm"
                className="hidden md:flex h-8 sm:h-10"
                onClick={() => onSelectConvertPages(doc.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Convert Pages
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onSelectDocument(doc)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>

                  {/* MOBILE ONLY: Dropdown Item */}
                  <DropdownMenuItem
                    className="md:hidden"
                    onClick={() => onSelectConvertPages(doc.id)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Convert Pages
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export Dataset
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(doc.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main Page Component ---

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await listDocuments();
        setDocuments(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load documents";
        showToast({ message, variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      showToast({ message: "Document deleted", variant: "success" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete document";
      showToast({ message, variant: "error" });
    }
  };

  const handleConvertPages = async (documentId: string) => {
    try {
      await convertDocumentPages(documentId);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === documentId ? { ...doc, status: "processed" } : doc
        )
      );
      showToast({
        message: "All pages converted successfully",
        variant: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to convert pages";
      showToast({ message, variant: "error" });
    }
  };

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) =>
        (doc.original_filename || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ),
    [documents, searchQuery]
  );

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Documents</h1>
              <p className="text-muted-foreground">
                Manage and track your document processing pipeline
              </p>
            </div>
            <Link href="/upload">
              <Button className="gap-2">
                <FileText className="h-4 w-4" />
                Upload New Document
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm border-0 focus-visible:ring-0 p-0"
                />
              </div>
            </CardHeader>
            <CardContent>
              <DocumentList
                isLoading={isLoading}
                documents={filteredDocuments}
                onSelectDocument={setSelectedDoc}
                onSelectConvertPages={handleConvertPages}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Document Details Dialog */}
      <Dialog
        open={!!selectedDoc}
        onOpenChange={(open: boolean) => !open && setSelectedDoc(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedDoc && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-xl sm:text-2xl break-words">
                      {selectedDoc.original_filename || "Untitled"}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      Document uploaded on {formatDate(selectedDoc.created_at)}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Status Section */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Status</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedDoc.status)}
                  </div>
                </div>

                {/* Document Metadata */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pages
                    </p>
                    <p className="text-2xl font-bold">
                      {selectedDoc.total_pages ?? 0}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lines Extracted
                    </p>
                    <p className="text-2xl font-bold">
                      {(selectedDoc.lines_extracted ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lines Verified
                    </p>
                    <p className="text-2xl font-bold">
                      {(selectedDoc.lines_verified ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Verification Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {getVerificationProgress(
                        selectedDoc.lines_verified,
                        selectedDoc.lines_extracted
                      )}
                      %
                    </p>
                  </div>
                </div>

                {(selectedDoc.lines_extracted ?? 0) > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Verification Progress</h3>
                    <div className="space-y-2">
                      <Progress
                        value={getVerificationProgress(
                          selectedDoc.lines_verified,
                          selectedDoc.lines_extracted
                        )}
                        className="h-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        {(selectedDoc.lines_verified ?? 0).toLocaleString()} of{" "}
                        {(selectedDoc.lines_extracted ?? 0).toLocaleString()}{" "}
                        lines verified
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Information */}
                <div className="space-y-2 border-t pt-4">
                  <h3 className="font-semibold">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded</span>
                      <span>{formatDate(selectedDoc.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Document ID</span>
                      <span className="font-mono text-xs">
                        {selectedDoc.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 border-t pt-4">
                  <Button className="flex-1 gap-2">
                    <Eye className="h-4 w-4" />
                    View Full Document
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Export Dataset
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      Close
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
