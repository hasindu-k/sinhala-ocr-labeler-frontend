"use client";

import { useState, useCallback, useEffect } from "react";
import HandwritingUploader from "@/components/HandwritingUploader";
import {
  CheckCircle2,
  RotateCcw,
  Home,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NavHeader } from "@/components/nav-header";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";

const TOTAL_SAMPLES = 10;
const CORPUS_TIER = "tier-1"; // Options: easy, medium, hard

export default function HandwritingPage() {
  const { user } = useAuth();
  const [completedSamples, setCompletedSamples] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [promptsError, setPromptsError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedProgress = localStorage.getItem("handwriting_progress");
    if (savedProgress) {
      const { samples, imagesCount } = JSON.parse(savedProgress);
      setCompletedSamples(samples);
      setUploadedImages(Array(imagesCount).fill(null));
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(
        "handwriting_progress",
        JSON.stringify({
          samples: completedSamples,
          imagesCount: uploadedImages.length,
        }),
      );
    }
  }, [completedSamples, uploadedImages, isHydrated]);

  useEffect(() => {
    if (isHydrated) {
      resetProgress();
    }
  }, [user?.id, isHydrated]);

  // Fetch sentences from API
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setPromptsLoading(true);
        setPromptsError(null);
        const response = await fetch(`${API_BASE_URL}/handwriting/corpus`);

        if (!response.ok) {
          throw new Error(`Failed to fetch sentences: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle array or object with sentences property
        const sentences = Array.isArray(data) ? data : data.sentences || [];

        if (sentences.length === 0) {
          throw new Error("No sentences received from API");
        }

        setPrompts(sentences);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load sentences";
        setPromptsError(errorMessage);
        console.error("Error fetching prompts:", error);
      } finally {
        setPromptsLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const getCurrentPrompt = useCallback(() => {
    if (prompts.length === 0) return "Loading...";
    const promptIndex = completedSamples % prompts.length;
    return prompts[promptIndex];
  }, [completedSamples, prompts]);

  const handleImageSubmit = useCallback((image: File) => {
    setUploadedImages((prev) => [...prev, image]);
    setCompletedSamples((prev) => prev + 1);

    console.log("Submitted:", image.name);
  }, []);

  const resetProgress = () => {
    setCompletedSamples(0);
    setUploadedImages([]);
    localStorage.removeItem("handwriting_progress");
  };

  const isComplete = completedSamples >= TOTAL_SAMPLES;

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="mx-auto max-w-md text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="font-sinhala text-3xl font-bold text-foreground">
              සම්පූර්ණයි! 🎉
            </h1>
            <p className="font-sinhala text-lg text-muted-foreground">
              ඔබ සාර්ථකව සාම්පල {TOTAL_SAMPLES}ක් එකතු කර ඇත.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                resetProgress();
              }}
              variant="outline"
              className="font-sinhala gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              නැවත ආරම්භ කරන්න
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavHeader />
      {!user && (
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-12 items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      )}
      <main className="bg-background min-h-screen">
        {promptsError ? (
          <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
            <div className="mx-auto max-w-md text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Unable to Load Sentences
              </h2>
              <p className="text-sm text-muted-foreground">{promptsError}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="default"
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <HandwritingUploader
            onSubmit={handleImageSubmit}
            completedSamples={completedSamples}
            totalSamples={TOTAL_SAMPLES}
            promptText={getCurrentPrompt()}
            isLoading={promptsLoading}
          />
        )}
      </main>
    </>
  );
}
