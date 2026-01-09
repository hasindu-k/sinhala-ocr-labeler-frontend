import { apiFetch } from "@/lib/client";
import { API_BASE_URL } from "@/lib/config";
import type { DocumentResponse, LineResponse } from "@/types/documents";

export async function uploadDocuments(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  return apiFetch<DocumentResponse[]>(`${API_BASE_URL}/documents/upload`, {
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

export async function extractLinesFromPages(documentId: string) {
  return apiFetch<{
    document_id: string;
    total_lines_extracted: number;
  }>(`${API_BASE_URL}/documents/${documentId}/extract-lines`, {
    method: "POST",
  });
}

export async function extractTextForDocument(documentId: string) {
  return apiFetch<{ status: string }>(
    `${API_BASE_URL}/documents/${documentId}/extract-text`,
    {
      method: "POST",
    }
  );
}

export async function listDocumentLines(
  documentId: string,
  params?: { verified?: boolean; page_num?: number; assigned_to?: string }
) {
  const search = new URLSearchParams();
  if (params?.verified !== undefined)
    search.set("verified", String(params.verified));
  if (params?.page_num !== undefined)
    search.set("page_num", String(params.page_num));
  if (params?.assigned_to) search.set("assigned_to", params.assigned_to);

  const query = search.toString();
  const suffix = query ? `?${query}` : "";

  return apiFetch<LineResponse[]>(
    `${API_BASE_URL}/documents/${documentId}/lines${suffix}`,
    {
      method: "GET",
    }
  );
}

export async function getLine(lineId: string) {
  return apiFetch<LineResponse>(`${API_BASE_URL}/api/lines/${lineId}`, {
    method: "GET",
  });
}

export async function deleteLine(
  lineId: string,
  options: { hard?: boolean } = {}
) {
  const suffix = options.hard ? "?hard=true" : "";

  return apiFetch<void>(`${API_BASE_URL}/api/lines/${lineId}${suffix}`, {
    method: "DELETE",
  });
}

export async function invalidateLine(lineId: string) {
  return apiFetch<{ status: string; line_id: string; is_invalid: boolean }>(
    `${API_BASE_URL}/api/lines/${lineId}/invalidate`,
    {
      method: "PUT",
    }
  );
}

export async function restoreLine(lineId: string) {
  return apiFetch<{ status: string; line_id: string; is_invalid: boolean }>(
    `${API_BASE_URL}/api/lines/${lineId}/restore`,
    {
      method: "PUT",
    }
  );
}

export async function extractTextFromLine(lineImageId: string) {
  return apiFetch<{
    status: string;
    line_image_id: string;
    extracted_text: string;
    language: string;
    processing_time_seconds: number;
  }>(`${API_BASE_URL}/api/lines/${lineImageId}/extract-text`, {
    method: "POST",
  });
}

export async function saveCorrectedText(
  lineImageId: string,
  correctedText: string
) {
  return apiFetch<{
    status: string;
    line_id: string;
    corrected_text: string;
    gt_file_updated: boolean;
  }>(`${API_BASE_URL}/api/lines/${lineImageId}/corrected-text`, {
    method: "PUT",
    body: JSON.stringify({ corrected_text: correctedText }),
  });
}

export async function verifyLine(lineImageId: string, correctedText: string) {
  return apiFetch<{
    status: string;
    line_id: string;
    verified: boolean;
  }>(`${API_BASE_URL}/api/lines/${lineImageId}/verify`, {
    method: "PUT",
    body: JSON.stringify({ corrected_text: correctedText }),
  });
}

export async function listFinalizedDatasets() {
  return apiFetch<
    Array<{
      name: string;
      documents: number;
      totalLines: number;
      verifiedLines: number;
      createdAt: string;
      size: string;
    }>
  >(`${API_BASE_URL}/documents/finalized-datasets`, {
    method: "GET",
  });
}

export async function downloadFinalizedDataset(datasetName: string) {
  const { getAccessToken } = await import("@/lib/localStore");
  const token = getAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/documents/finalized-datasets/${datasetName}/download`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download dataset");
  }

  return response.blob();
}

export async function createFinalizedDataset(documentId: string) {
  return apiFetch<{ status: string; dataset_name: string }>(
    `${API_BASE_URL}/documents/${documentId}/create-finalized`,
    {
      method: "POST",
    }
  );
}

export async function updateLineImage(lineId: string, formData: FormData) {
  return apiFetch<LineResponse>(`${API_BASE_URL}/api/lines/${lineId}/images`, {
    method: "POST",
    body: formData,
  });
}
