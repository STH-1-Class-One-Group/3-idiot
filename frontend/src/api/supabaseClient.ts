import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { clientEnv } from '../config/clientEnv';

export const hasSupabaseConfig = Boolean(
  clientEnv.supabaseUrl && clientEnv.supabaseAnonKey
);

const SUPABASE_CONFIG_ERROR_MESSAGE =
  'Supabase browser client is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.';

let supabaseClient: SupabaseClient | null = null;

const createSupabaseBrowserClient = () =>
  createClient(clientEnv.supabaseUrl, clientEnv.supabaseAnonKey);

export const requireSupabaseBrowserClient = (): SupabaseClient => {
  if (!hasSupabaseConfig) {
    throw new Error(SUPABASE_CONFIG_ERROR_MESSAGE);
  }

  if (!supabaseClient) {
    supabaseClient = createSupabaseBrowserClient();
  }

  return supabaseClient;
};

export const getSupabaseBrowserClient = (): SupabaseClient | null => {
  if (!hasSupabaseConfig) {
    return null;
  }

  return requireSupabaseBrowserClient();
};

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = requireSupabaseBrowserClient();
    const value = client[property as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export const getSupabaseConfigErrorMessage = () => SUPABASE_CONFIG_ERROR_MESSAGE;

export const getSupabaseErrorMessage = (error: unknown) => {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: string }).message || '')
      : '';

  if (message.includes('API key')) {
    return 'Supabase API key is not recognized. Please check your environment variables.';
  }

  if (message.includes('JWT') || message.includes('row-level security')) {
    return 'Supabase rejected the request. Check the anon key and your table policies.';
  }

  if (message.includes('placeholder.supabase.co')) {
    return SUPABASE_CONFIG_ERROR_MESSAGE;
  }

  return message || 'Failed to communicate with Supabase.';
};

export const getSupabaseRuntimeErrorMessage = (
  error: unknown,
  fallback = 'Failed to communicate with Supabase.'
) => {
  if (!hasSupabaseConfig) {
    return SUPABASE_CONFIG_ERROR_MESSAGE;
  }

  const message = getSupabaseErrorMessage(error);
  if (message.includes('Supabase browser client is not configured')) {
    return SUPABASE_CONFIG_ERROR_MESSAGE;
  }

  return message || fallback;
};

export const getSupabaseAccessToken = async (): Promise<string | null> => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return null;
  }

  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return session?.access_token ?? null;
};

export const getSupabaseCurrentUser = async (): Promise<User | null> => {
  const client = getSupabaseBrowserClient();

  if (!client) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  return user ?? null;
};

export const getSupabaseStoragePublicUrl = (
  bucket: string,
  path?: string | null
): string => {
  const normalizedPath = path?.trim().replace(/^\/+/, '') ?? '';

  if (!normalizedPath) {
    return '';
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return '';
  }

  return client.storage.from(bucket).getPublicUrl(normalizedPath).data.publicUrl;
};
