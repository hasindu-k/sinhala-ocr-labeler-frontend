import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DocumentResponse } from "@/types/documents";
import { FileText, MoreVertical, Trash2, Eye, Loader2 } from "lucide-react";
import { formatDate, getVerificationProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getStatusBadge } from "./getStatusBadge";
import Link from "next/link";

interface DocumentListProps {
  isLoading: boolean;
  documents: DocumentResponse[];
  onSelectDocument: (doc: DocumentResponse) => void;
  onSelectConvertPages: (id: string) => void;
  onSelectExtractLines: (id: string) => void;
  onDelete: (id: string) => void;
  isConverting: boolean;
  isExtracting: boolean;
}

export default function DocumentList({
  isLoading,
  documents,
  onSelectDocument,
  onSelectConvertPages,
  onSelectExtractLines,
  onDelete,
  isConverting,
  isExtracting,
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
              <a
                href={doc.stored_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                title="Open PDF"
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </a>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={doc.stored_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold truncate text-sm sm:text-base hover:text-primary hover:underline cursor-pointer"
                  >
                    {doc.original_filename || "Untitled"}
                  </a>
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
              {doc.status == "uploaded" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex h-8 sm:h-10"
                  onClick={() => onSelectConvertPages(doc.id)}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {isConverting ? "Converting..." : "Convert Pages"}
                </Button>
              )}
              {doc.status == "processed" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex h-8 sm:h-10"
                  onClick={() => {
                    onSelectExtractLines(doc.id);
                  }}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {isExtracting ? "Extracting..." : "Extract Lines"}
                </Button>
              )}

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
                  <Link href={`/label?doc=${doc.id}`}>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View & Label
                    </DropdownMenuItem>
                  </Link>

                  {/* MOBILE ONLY: Dropdown Item */}
                  <DropdownMenuItem
                    className="md:hidden"
                    onClick={() => onSelectConvertPages(doc.id)}
                    disabled={isConverting}
                  >
                    {isConverting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    {isConverting ? "Converting..." : "Convert Pages"}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="md:hidden"
                    onClick={() => {
                      onSelectExtractLines(doc.id);
                    }}
                    disabled={isExtracting}
                  >
                    {isExtracting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    {isExtracting ? "Extracting..." : "Extract Lines"}
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
