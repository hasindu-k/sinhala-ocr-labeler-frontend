import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const getStatusBadge = (status: string) => {
  const normalized = (status || "").toLowerCase();
  switch (normalized) {
    case "processed":
    case "completed":
    case "extracted":
      return (
        <Badge className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          {status}
        </Badge>
      );
    case "processing":
    case "in-progress":
      return (
        <Badge className="gap-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400">
          <AlertCircle className="h-3 w-3" />
          {status}
        </Badge>
      );
    case "uploaded":
      return (
        <Badge className="gap-1 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300">
          <AlertCircle className="h-3 w-3" />
          Uploaded
        </Badge>
      );
    case "failed":
      return (
        <Badge className="gap-1 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge className="gap-1" variant="secondary">
          <AlertCircle className="h-3 w-3" />
          {status || "pending"}
        </Badge>
      );
  }
};

export default getStatusBadge;
