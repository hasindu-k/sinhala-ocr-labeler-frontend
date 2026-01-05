import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  CheckCircle2,
  Database,
  ArrowRight,
} from "lucide-react";
import { NavHeader } from "@/components/nav-header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-12">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Hero Section */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-balance lg:text-5xl">
              Professional Document Annotation Platform
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              Transform PDFs into high-quality training data. Extract, label,
              and verify text lines with powerful collaboration tools designed
              for annotation teams.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Link href="/upload">
                <Button size="lg" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document
                </Button>
              </Link>
              <Link href="/documents">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  View Documents
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Upload PDFs</CardTitle>
                <CardDescription>
                  Drag and drop PDF documents for automatic processing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Extract Lines</CardTitle>
                <CardDescription>
                  Automatic line detection and text extraction from pages
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Verify & Correct</CardTitle>
                <CardDescription>
                  Human-in-the-loop verification with annotation tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Export Datasets</CardTitle>
                <CardDescription>
                  Download verified training data in standard formats
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Workflow Section */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Simple workflow for creating high-quality training data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    1
                  </div>
                  <h3 className="font-semibold">Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload PDF documents to start the processing pipeline
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    2
                  </div>
                  <h3 className="font-semibold">Process</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatic conversion to images and line extraction
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    3
                  </div>
                  <h3 className="font-semibold">Label</h3>
                  <p className="text-sm text-muted-foreground">
                    Annotate and correct extracted text line by line
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    4
                  </div>
                  <h3 className="font-semibold">Export</h3>
                  <p className="text-sm text-muted-foreground">
                    Download verified datasets for model training
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
