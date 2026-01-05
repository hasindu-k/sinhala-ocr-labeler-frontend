export interface DocumentResponse {
  id: string;
  original_filename: string;
  stored_path: string;
  status: string;
  total_pages: number;
  lines_extracted?: number;
  lines_verified?: number;
  pages_folder?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LineExtractionResponse {
  document_id: string;
  total_lines_extracted: number;
}

export interface LineResponse {
  id: string;
  page_id: string;
  image_path: string;
  auto_text: string | null;
  corrected_text: string | null;
  verified: boolean;
  reviewer_id: string | null;
}
