"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { NavHeader } from "@/components/nav-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { FileText, Search, Download, Eye } from "lucide-react";

import {
  listDocuments,
  deleteDocument,
  convertDocumentPages,
} from "@/lib/documents-api";
import type { DocumentResponse } from "@/types/documents";
import { showToast } from "@/lib/toast";
import { getVerificationProgress, formatDate } from "@/lib/utils";
import DocumentList from "./document-list";
import { getStatusBadge } from "./getStatusBadge";

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
