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

export async function getTeamActivity(
  range: "weekly" | "monthly" | "all" = "weekly"
) {
  return apiFetch<
    Array<{
      user_id: string;
      name: string;
      verified_lines: number;
    }>
  >(`${API_BASE_URL}/dashboard/team-activity?range=${range}`, {
    method: "GET",
  });
}
