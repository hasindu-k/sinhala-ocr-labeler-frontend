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
  status: string;
  page_id: string;
  lines_extracted: number;
}
