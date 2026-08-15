import { ApiError } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export class CustomApiError extends Error {
  status: number;
  detail: ApiError['detail'];

  constructor(status: number, detail: ApiError['detail']) {
    const message = typeof detail === 'string' 
      ? detail 
      : Array.isArray(detail) && detail[0]?.msg 
        ? detail[0].msg 
        : 'An error occurred';
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | FormData | URLSearchParams | string;
  isFormUrlEncoded?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, isFormUrlEncoded, headers: customHeaders, ...customConfig } = options;
  const token = getStoredToken();

  const headers: Record<string, string> = { ...customHeaders as Record<string, string> };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let formattedBody: BodyInit | undefined;

  if (isFormUrlEncoded && body) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    formattedBody = body instanceof URLSearchParams ? body : new URLSearchParams(body as Record<string, string>).toString();
  } else if (body && !(body instanceof FormData) && typeof body !== 'string') {
    headers['Content-Type'] = 'application/json';
    formattedBody = JSON.stringify(body);
  } else if (body) {
    formattedBody = body as BodyInit;
  }

  const config: RequestInit = {
    method: options.method || (body ? 'POST' : 'GET'),
    headers,
    body: formattedBody,
    ...customConfig,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorDetail: ApiError['detail'] = 'Something went wrong';
    try {
      const errorJson = await response.json();
      if (errorJson.detail) errorDetail = errorJson.detail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }

    // 401 Unauthorized -> Clear expired token and redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      setStoredToken(null);
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?expired=true`;
      }
    }

    throw new CustomApiError(response.status, errorDetail);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}