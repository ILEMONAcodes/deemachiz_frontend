import { apiClient, setStoredToken, getStoredToken } from './api-client';

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  phone?: string;
  role?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

/**
 * LOGIN USER
 * Passes email as `username` via x-www-form-urlencoded to match FastAPI's OAuth2PasswordRequestForm
 */
export async function loginUser(email: string, password: string): Promise<AuthTokenResponse> {
  const data = await apiClient<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    isFormUrlEncoded: true,
    body: {
      username: email.trim(),
      password: password,
    },
  });

  if (data?.access_token) {
    setStoredToken(data.access_token);
  }

  return data;
}

/**
 * REGISTER USER
 * Sends JSON body matching your UserCreate schema
 */
export async function registerUser(userData: RegisterPayload): Promise<UserProfile> {
  return await apiClient<UserProfile>('/auth/register', {
    method: 'POST',
    body: userData as unknown as Record<string, unknown>,
  });
}

/**
 * GET CURRENT USER PROFILE (/auth/me)
 */
export async function getCurrentUser(): Promise<UserProfile> {
  return await apiClient<UserProfile>('/auth/me');
}

/**
 * LOGOUT USER
 * Clears local storage token and redirects to login
 */
export function logoutUser(): void {
  setStoredToken(null);
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * CHECK AUTH STATUS
 */
export function isAuthenticated(): boolean {
  return !!getStoredToken();
}