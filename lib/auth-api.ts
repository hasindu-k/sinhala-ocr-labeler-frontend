import { apiFetch } from "@/lib/client";
import { API_BASE_URL } from "@/lib/config";
import type { SignupRequest, TokenResponse } from "@/types/auth";

export function signup(data: SignupRequest) {
  return apiFetch<TokenResponse>(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function signin(email: string, password: string) {
  return apiFetch<TokenResponse>(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signout() {
  return apiFetch<{ message: string }>(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
  });
}
