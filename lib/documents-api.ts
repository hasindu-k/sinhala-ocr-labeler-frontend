import { apiFetch } from "@/lib/client";
import { API_BASE_URL } from "@/lib/config";
import type { DocumentResponse } from "@/types/documents";

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<DocumentResponse>(`${API_BASE_URL}/documents/upload`, {
    method: "POST",
    body: formData,
  });
}

export async function listDocuments() {
  return apiFetch<DocumentResponse[]>(`${API_BASE_URL}/documents/`, {
    method: "GET",
  });
}

export async function deleteDocument(documentId: string) {
  return apiFetch<{ message: string }>(
    `${API_BASE_URL}/documents/${documentId}`,
    {
      method: "DELETE",
    }
  );
}

export async function convertDocumentPages(documentId: string) {
  return apiFetch<DocumentResponse>(
    `${API_BASE_URL}/documents/${documentId}/convert-pages`,
    {
      method: "POST",
    }
  );
}

export async function extractLinesFromPage(documentId: string, pageId: string) {
  return apiFetch<{ status: string; page_id: string; lines_extracted: number }>(
    `${API_BASE_URL}/documents/${documentId}/pages/${pageId}/extract-lines`,
    {
      method: "POST",
    }
  );
}
