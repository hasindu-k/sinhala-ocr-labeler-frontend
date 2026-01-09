import { apiFetch } from "@/lib/client";
import { API_BASE_URL } from "@/lib/config";

export async function getVerificationStats() {
  return apiFetch<{
    total_lines: number;
    verified_lines: number;
    unverified_lines: number;
    pending_reviews: number;
  }>(`${API_BASE_URL}/dashboard/verification-stats`, {
    method: "GET",
  });
}

// pendingReview: 0;
// totalLines: 653;
// unverifiedLines: 464;
// verifiedLines: 189;
