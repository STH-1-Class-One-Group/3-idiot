import { supabase } from '../../api/supabaseClient';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getNewsRequestHeaders = async (): Promise<HeadersInit> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {};
  const token = session?.access_token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const fetchNewsBatch = async (
  limit: number,
  start: number,
  options?: { signal?: AbortSignal; forceRefresh?: boolean }
) => {
  const headers = await getNewsRequestHeaders();
  const params = new URLSearchParams({
    limit: String(limit),
    start: String(start),
    force_refresh: options?.forceRefresh ? 'true' : 'false',
  });

  return fetch(`${apiUrl}/api/v1/news?${params.toString()}`, {
    signal: options?.signal,
    headers,
  });
};

export const fetchNewsDebug = async (
  limit: number,
  start: number,
  options?: { signal?: AbortSignal; forceRefresh?: boolean }
) => {
  const headers = await getNewsRequestHeaders();
  const params = new URLSearchParams({
    limit: String(limit),
    start: String(start),
    force_refresh: options?.forceRefresh ? 'true' : 'false',
  });

  return fetch(`${apiUrl}/api/v1/news/debug?${params.toString()}`, {
    signal: options?.signal,
    headers,
  });
};
