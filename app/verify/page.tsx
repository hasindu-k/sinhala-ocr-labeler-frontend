"use client";

import { useState } from "react";
import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Search,
  Filter,
  Eye,
  Users,
  FileText,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Mock data
const mockUnverifiedLines = [
  {
    id: "1",
    lineNumber: 45,
    documentName: "historical-manuscript-1890.pdf",
    pageNumber: 3,
    autoText: "In the year of our Lord eighteen hundred",
    correctedText: "In the year of our Lord eighteen hundred",
    assignedTo: "John Doe",
    status: "pending",
  },
  {
    id: "2",
    lineNumber: 78,
    documentName: "legal-document-bundle.pdf",
    pageNumber: 5,
    autoText: "Pursuant to Section 12(a) of the Act",
    correctedText: "Pursuant to Section 12(a) of the Act",
    assignedTo: "Jane Smith",
    status: "pending",
  },
  {
    id: "3",
    lineNumber: 92,
    documentName: "historical-manuscript-1890.pdf",
    pageNumber: 6,
    autoText: "witnessed by the undersigned notary",
    correctedText: "witnessed by the undersigned notary public",
    assignedTo: "John Doe",
    status: "pending",
  },
  {
    id: "4",
    lineNumber: 123,
    documentName: "legal-document-bundle.pdf",
    pageNumber: 8,
    autoText: "This agreement shall be binding upon",
    correctedText: "This agreement shall be binding upon",
    assignedTo: null,
    status: "pending",
  },
];

const mockStats = {
  totalLines: 6550,
  verifiedLines: 5190,
  unverifiedLines: 1360,
  pendingReview: 450,
};

const mockChartData = [
  { name: "Mon", verified: 245, pending: 56 },
  { name: "Tue", verified: 312, pending: 48 },
  { name: "Wed", verified: 289, pending: 62 },
  { name: "Thu", verified: 356, pending: 41 },
  { name: "Fri", verified: 298, pending: 53 },
  { name: "Sat", verified: 178, pending: 34 },
  { name: "Sun", verified: 134, pending: 28 },
];

export default function VerifyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDocument, setFilterDocument] = useState("all");
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [lines] = useState(mockUnverifiedLines);

  const filteredLines = lines.filter((line) => {
    const matchesSearch =
      line.autoText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      line.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || line.status === filterStatus;
    const matchesDocument =
      filterDocument === "all" || line.documentName === filterDocument;
    return matchesSearch && matchesStatus && matchesDocument;
  });

  const handleSelectAll = () => {
    if (selectedLines.length === filteredLines.length) {
      setSelectedLines([]);
    } else {
      setSelectedLines(filteredLines.map((line) => line.id));
    }
  };

  const handleSelectLine = (lineId: string) => {
    setSelectedLines((current) =>
      current.includes(lineId)
        ? current.filter((id) => id !== lineId)
        : [...current, lineId]
    );
  };

  const handleBulkVerify = () => {
    alert(`Verifying ${selectedLines.length} lines...`);
    setSelectedLines([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-6 px-4 sm:px-6">
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Verification Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Review, filter, and verify annotated text lines
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="w-full flex justify-start overflow-x-auto sm:justify-center sm:overflow-visible gap-2 p-1">
              <TabsTrigger
                value="overview"
                className="min-w-[100px] sm:min-w-[120px]"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="lines"
                className="min-w-[120px] sm:min-w-[140px]"
              >
                Unverified Lines
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="min-w-[100px] sm:min-w-[120px]"
              >
                Statistics
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Total Lines
                    </CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl">
                      {mockStats.totalLines.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                      Verified
                    </CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl text-green-600 dark:text-green-400">
                      {mockStats.verifiedLines.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                      <AlertCircle className="h-4 w-4" />
                      Unverified
                    </CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl text-yellow-600 dark:text-yellow-400">
                      {mockStats.unverifiedLines.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Pending
                    </CardDescription>
                    <CardTitle className="text-2xl sm:text-3xl">
                      {mockStats.pendingReview.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Verification Progress</CardTitle>
                  <CardDescription>
                    Weekly verification activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-2 sm:px-4 pb-6">
                  {/* UPDATED: Added a wrapping div for horizontal scrolling on mobile */}
                  <div className="w-full overflow-x-auto pb-4">
                    {/* UPDATED: Added min-width to ensure chart doesn't get crushed */}
                    <div className="min-w-[600px]">
                      <ChartContainer
                        config={{
                          verified: {
                            label: "Verified",
                            color: "hsl(var(--chart-1))",
                          },
                          pending: {
                            label: "Pending",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-64 md:h-80"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={mockChartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Bar
                              dataKey="verified"
                              fill="var(--color-verified)"
                              name="Verified"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar
                              dataKey="pending"
                              fill="var(--color-pending)"
                              name="Pending"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Unverified Lines Tab */}
            <TabsContent value="lines" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <CardTitle>Unverified Lines</CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {filteredLines.length} lines pending verification
                      </CardDescription>
                    </div>
                    {selectedLines.length > 0 && (
                      <Button
                        onClick={handleBulkVerify}
                        className="gap-2 w-full sm:w-fit"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Verify {selectedLines.length} Selected
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search lines..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select
                      value={filterDocument}
                      onValueChange={setFilterDocument}
                    >
                      <SelectTrigger className="w-full md:w-64">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="All Documents" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Documents</SelectItem>
                        <SelectItem value="historical-manuscript-1890.pdf">
                          Historical Manuscript
                        </SelectItem>
                        <SelectItem value="legal-document-bundle.pdf">
                          Legal Documents
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lines List */}
                  <div className="space-y-3">
                    {filteredLines.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 px-4 py-2 border-b">
                          <Checkbox
                            checked={
                              selectedLines.length === filteredLines.length
                            }
                            onCheckedChange={handleSelectAll}
                          />
                          <span className="text-sm font-medium">
                            Select All
                          </span>
                        </div>
                        {filteredLines.map((line) => (
                          <div
                            key={line.id}
                            className="flex flex-col sm:flex-row sm:items-start gap-3 rounded-lg border p-4 hover:bg-accent/50"
                          >
                            <Checkbox
                              checked={selectedLines.includes(line.id)}
                              onCheckedChange={() => handleSelectLine(line.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0 space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="font-semibold">
                                    Line {line.lineNumber}
                                  </span>
                                  <span className="text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-muted-foreground">
                                    {line.documentName}
                                  </span>
                                  <span className="text-muted-foreground">
                                    •
                                  </span>
                                  <span className="text-muted-foreground">
                                    Page {line.pageNumber}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="shrink-0 gap-2 w-full sm:w-auto"
                                >
                                  <Eye className="h-4 w-4" />
                                  View
                                </Button>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">
                                  Auto: {line.autoText}
                                </p>
                                {line.correctedText !== line.autoText && (
                                  <p className="text-sm font-medium">
                                    Corrected: {line.correctedText}
                                  </p>
                                )}
                              </div>
                              {line.assignedTo && (
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    Assigned to {line.assignedTo}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-3" />
                        <h3 className="font-semibold mb-1">
                          No unverified lines found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          All lines matching your filters are verified
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Verification Rate
                    </CardTitle>
                    <CardDescription>
                      Overall completion percentage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold text-primary">
                      {Math.round(
                        (mockStats.verifiedLines / mockStats.totalLines) * 100
                      )}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {mockStats.verifiedLines.toLocaleString()} of{" "}
                      {mockStats.totalLines.toLocaleString()} lines verified
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Activity
                    </CardTitle>
                    <CardDescription>
                      Active annotators this week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">John Doe</span>
                        <Badge>456 lines</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Jane Smith</span>
                        <Badge>389 lines</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Bob Wilson</span>
                        <Badge>267 lines</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
