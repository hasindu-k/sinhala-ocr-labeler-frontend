"use client";

import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
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
