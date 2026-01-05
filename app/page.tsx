"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/documents");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to /documents
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header for Landing */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">DocLabel</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

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
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  Sign In
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
