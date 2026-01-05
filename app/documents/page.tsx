"use client";

import { useState } from "react";
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
  Clock,
  AlertCircle,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const mockDocuments = [
  {
    id: "1",
    name: "historical-manuscript-1890.pdf",
    uploadedAt: "2025-01-04T10:30:00",
    pages: 45,
    linesExtracted: 1250,
    linesVerified: 890,
    status: "processing",
  },
  {
    id: "2",
    name: "census-records-1920.pdf",
    uploadedAt: "2025-01-03T14:20:00",
    pages: 120,
    linesExtracted: 3200,
    linesVerified: 3200,
    status: "completed",
  },
  {
    id: "3",
    name: "legal-document-bundle.pdf",
    uploadedAt: "2025-01-02T09:15:00",
    pages: 78,
    linesExtracted: 2100,
    linesVerified: 450,
    status: "in-progress",
  },
  {
    id: "4",
    name: "newspaper-archive-1945.pdf",
    uploadedAt: "2025-01-01T16:45:00",
    pages: 200,
    linesExtracted: 0,
    linesVerified: 0,
    status: "pending",
  },
];

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents] = useState(mockDocuments);
  const [selectedDoc, setSelectedDoc] = useState<
    (typeof mockDocuments)[0] | null
  >(null);

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="gap-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case "processing":
        return (
          <Badge className="gap-1 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        );
      default:
        return (
          <Badge className="gap-1" variant="secondary">
            <AlertCircle className="h-3 w-3" />
            Pending
          </Badge>
        );
    }
  };

  const getVerificationProgress = (verified: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((verified / total) * 100);
  };

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
              <div className="space-y-4">
                {filteredDocuments.map((doc) => {
                  const progress = getVerificationProgress(
                    doc.linesVerified,
                    doc.linesExtracted
                  );
                  return (
                    <div
                      key={doc.id}
                      className="rounded-lg border p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* UPDATED: Smaller icon on mobile (h-8 w-8) -> larger on desktop (sm:h-10) */}
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border bg-card">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          </div>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold truncate text-sm sm:text-base">
                                {doc.name}
                              </h3>
                              {getStatusBadge(doc.status)}
                            </div>

                            {/* UPDATED: Responsive metadata. Tighter gap, hidden dots on mobile */}
                            <div className="flex flex-wrap gap-y-1 gap-x-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span>{doc.pages} pages</span>
                              <span className="hidden sm:inline">•</span>
                              <span>
                                {doc.linesExtracted.toLocaleString()} lines
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span>
                                Uploaded{" "}
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </span>
                            </div>

                            {doc.linesExtracted > 0 && (
                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">
                                    Verification Progress
                                  </span>
                                  <span className="font-medium">
                                    {progress}%
                                  </span>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                              </div>
                            )}
                          </div>
                        </div>

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
                            <DropdownMenuItem
                              onClick={() => setSelectedDoc(doc)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export Dataset
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                      {selectedDoc.name}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      Document uploaded on{" "}
                      {new Date(selectedDoc.uploadedAt).toLocaleDateString()}
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
                    <p className="text-2xl font-bold">{selectedDoc.pages}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lines Extracted
                    </p>
                    <p className="text-2xl font-bold">
                      {selectedDoc.linesExtracted.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lines Verified
                    </p>
                    <p className="text-2xl font-bold">
                      {selectedDoc.linesVerified.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Verification Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {selectedDoc.linesExtracted > 0
                        ? Math.round(
                            (selectedDoc.linesVerified /
                              selectedDoc.linesExtracted) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>

                {/* Verification Progress Bar */}
                {selectedDoc.linesExtracted > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Verification Progress</h3>
                    <div className="space-y-2">
                      <Progress
                        value={Math.round(
                          (selectedDoc.linesVerified /
                            selectedDoc.linesExtracted) *
                            100
                        )}
                        className="h-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        {selectedDoc.linesVerified.toLocaleString()} of{" "}
                        {selectedDoc.linesExtracted.toLocaleString()} lines
                        verified
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
                      <span>
                        {new Date(selectedDoc.uploadedAt).toLocaleString()}
                      </span>
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
