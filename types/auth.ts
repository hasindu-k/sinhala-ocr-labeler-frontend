export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: TokenUserResponse;
}

export interface TokenUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}
