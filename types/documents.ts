export interface DocumentResponse {
  id: string;
  name?: string;
  original_filename: string;
  stored_path: string;
  status: string;
  total_pages: number;
  lines_extracted?: number;
  lines_verified?: number;
  document_type: "pdf" | "image";
  uploaded_by: string;
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
  image_url?: string;
  gt_text_path?: string;
  auto_text: string | null;
  corrected_text: string | null;
  gt_text_content?: string;
  verified: boolean;
  is_invalid?: boolean;
  reviewer_id: string | null;
  page_number: number;
  created_at?: string;
  updated_at?: string;
}
