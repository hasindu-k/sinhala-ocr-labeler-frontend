import { Suspense } from "react";
import { LabelContent } from "./label-content";

export default function LabelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <LabelContent />
    </Suspense>
  );
}
