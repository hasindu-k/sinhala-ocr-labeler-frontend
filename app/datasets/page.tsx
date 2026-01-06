"use client";

import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, CheckCircle2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import {
  listFinalizedDatasets,
  downloadFinalizedDataset,
} from "@/lib/documents-api";
import { showToast } from "@/lib/toast";

type Dataset = {
  name: string;
  documents: number;
  totalLines: number;
  verifiedLines: number;
  createdAt: string;
  size: string;
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadDatasets();
  }, []);

  async function loadDatasets() {
    try {
      setLoading(true);
      const data = await listFinalizedDatasets();
      setDatasets(data);
    } catch (error) {
      showToast({ message: "Failed to load datasets", variant: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(datasetName: string) {
    try {
      setDownloading(datasetName);
      const blob = await downloadFinalizedDataset(datasetName);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${datasetName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast({
        message: "Dataset downloaded successfully",
        variant: "success",
      });
    } catch (error) {
      showToast({ message: "Failed to download dataset", variant: "error" });
      console.error(error);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Datasets</h1>
            <p className="text-muted-foreground">
              Export and manage verified annotation datasets
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Datasets</CardDescription>
                <CardTitle className="text-3xl">{datasets.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Documents</CardDescription>
                <CardTitle className="text-3xl">
                  {datasets.reduce((sum, ds) => sum + ds.documents, 0)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Verified Lines</CardDescription>
                <CardTitle className="text-3xl">
                  {datasets
                    .reduce((sum, ds) => sum + ds.verifiedLines, 0)
                    .toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Datasets</CardTitle>
              <CardDescription>
                Download verified datasets for model training
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading datasets...
                  </div>
                ) : datasets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No finalized datasets available yet
                  </div>
                ) : (
                  datasets.map((dataset) => (
                    <div key={dataset.name} className="rounded-lg border p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold mr-1">
                                {dataset.name}
                              </h3>
                              <Badge className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Ready
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                {dataset.documents} documents
                              </span>
                              <span>•</span>
                              <span>
                                {dataset.verifiedLines.toLocaleString()}{" "}
                                verified lines
                              </span>
                              <span>•</span>
                              <span>{dataset.size}</span>
                              <span>•</span>
                              <span>
                                Created{" "}
                                {new Date(
                                  dataset.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleDownload(dataset.name)}
                          disabled={downloading === dataset.name}
                          className="gap-2 w-full sm:w-auto shrink-0"
                        >
                          <Download className="h-4 w-4" />
                          {downloading === dataset.name
                            ? "Downloading..."
                            : "Download"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
