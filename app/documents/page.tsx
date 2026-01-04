"use client"

import { useState } from "react"
import Link from "next/link"
import { NavHeader } from "@/components/nav-header"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Search, MoreVertical, Download, Trash2, Eye, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
]

export default function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [documents] = useState(mockDocuments)

  const filteredDocuments = documents.filter((doc) => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="gap-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        )
      case "processing":
        return (
          <Badge className="gap-1 bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            Processing
          </Badge>
        )
      default:
        return (
          <Badge className="gap-1" variant="secondary">
            <AlertCircle className="h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  const getVerificationProgress = (verified: number, total: number) => {
    if (total === 0) return 0
    return Math.round((verified / total) * 100)
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Documents</h1>
              <p className="text-muted-foreground">Manage and track your document processing pipeline</p>
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
                  const progress = getVerificationProgress(doc.linesVerified, doc.linesExtracted)
                  return (
                    <div key={doc.id} className="rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-card">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold truncate">{doc.name}</h3>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span>{doc.pages} pages</span>
                              <span>•</span>
                              <span>{doc.linesExtracted.toLocaleString()} lines</span>
                              <span>•</span>
                              <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </div>
                            {doc.linesExtracted > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Verification Progress</span>
                                  <span className="font-medium">
                                    {doc.linesVerified.toLocaleString()} / {doc.linesExtracted.toLocaleString()} (
                                    {progress}%)
                                  </span>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                              </div>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
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
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
