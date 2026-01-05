import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DocumentResponse } from "@/types/documents";
import { FileText, MoreVertical, Trash2, Eye } from "lucide-react";
import { formatDate, getVerificationProgress } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getStatusBadge } from "./getStatusBadge";

interface DocumentListProps {
  isLoading: boolean;
  documents: DocumentResponse[];
  onSelectDocument: (doc: DocumentResponse) => void;
  onSelectConvertPages: (id: string) => void;
  onSelectExtractLines: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DocumentList({
  isLoading,
  documents,
  onSelectDocument,
  onSelectConvertPages,
  onSelectExtractLines,
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
              {doc.status == "uploaded" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex h-8 sm:h-10"
                  onClick={() => onSelectConvertPages(doc.id)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Convert Pages
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
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Extract Lines
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

                  <DropdownMenuItem
                    onClick={() => {
                      // Extract lines would be called here
                      // Placeholder for now
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Extract Lines
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
