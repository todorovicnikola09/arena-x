import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase';


const REST_URL = `${SUPABASE_URL}/rest/v1`;

class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token ?? SUPABASE_ANON_KEY;
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

type RestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  prefer?: string;
};


async function restRequest<T>(path: string, options: RestOptions = {}): Promise<T> {
  const headers = await getAuthHeaders();
  if (options.prefer) {
    headers['Prefer'] = options.prefer;
  }

  const response = await fetch(`${REST_URL}/${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const rawText = await response.text();

  if (!response.ok) {
    let errorBody: unknown = null;
    try {
      errorBody = rawText ? JSON.parse(rawText) : null;
    } catch {
      errorBody = rawText || null;
    }

    const message =
      errorBody && typeof errorBody === 'object' && 'message' in errorBody
        ? String((errorBody as any).message)
        : `PostgREST request failed: ${response.status} ${response.statusText}`;

    throw new ApiError(message, response.status, errorBody);
  }

  if (!rawText) {
    return undefined as T;
  }

  return JSON.parse(rawText) as T;
}

export const api = {
  get: <T>(path: string) => restRequest<T>(path, { method: 'GET' }),

  post: <T>(path: string, body: unknown, opts?: { returnRepresentation?: boolean }) =>
    restRequest<T>(path, {
      method: 'POST',
      body,
      prefer: opts?.returnRepresentation === false ? undefined : 'return=representation',
    }),

  patch: <T>(path: string, body: unknown, opts?: { returnRepresentation?: boolean }) =>
    restRequest<T>(path, {
      method: 'PATCH',
      body,
      prefer: opts?.returnRepresentation === false ? undefined : 'return=representation',
    }),

  delete: <T>(path: string) => restRequest<T>(path, { method: 'DELETE' }),
};

export { ApiError };