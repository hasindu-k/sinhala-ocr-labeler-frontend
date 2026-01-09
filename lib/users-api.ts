import { apiFetch } from "@/lib/client";
import { API_BASE_URL } from "@/lib/config";

export function createUserAdmin(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  return apiFetch<{ id: string; name: string; email: string; role: string }>(
    `${API_BASE_URL}/users/admin/create`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function updateUserAdmin(
  user_id: string,
  data: { name?: string; email?: string; role?: string; status?: string }
) {
  return apiFetch<{ id: string; name: string; email: string; role: string }>(
    `${API_BASE_URL}/users/${user_id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export function deleteUserAdmin(user_id: string) {
  return apiFetch<{ message: string }>(`${API_BASE_URL}/users/${user_id}`, {
    method: "DELETE",
  });
}
