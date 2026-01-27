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
import { Upload, FileText, ArrowRight, Loader2, PenTool } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
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
            {!user && (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Hero Section */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-balance lg:text-5xl">
              Sinhala Handwriting & Document Labeling
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              A dual-purpose platform to collect authentic Sinhala handwriting
              samples and transform PDFs into high-quality OCR training data.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Link href="/handwriting">
                <Button
                  size="lg"
                  variant="default"
                  className="gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  <PenTool className="h-4 w-4" />
                  Contribute Handwriting
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Annotate Documents
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Highlight */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <PenTool className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Handwriting Collection</CardTitle>
                <CardDescription>
                  Help us build the largest Sinhala handwriting dataset. Follow
                  prompts and upload photos of your writing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/handwriting">
                  <Button variant="link" className="px-0 text-orange-600">
                    Start writing now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Document Annotation</CardTitle>
                <CardDescription>
                  Professional tools for teams to label, verify, and export OCR
                  datasets from PDF documents.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/signup">
                  <Button variant="link" className="px-0">
                    Create team account <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
