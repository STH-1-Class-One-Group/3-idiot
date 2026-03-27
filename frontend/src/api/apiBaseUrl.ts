const DEFAULT_API_BASE_URL = 'http://localhost:8000';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

export const apiBaseUrl = trimTrailingSlashes(
  (process.env.REACT_APP_API_URL || DEFAULT_API_BASE_URL).trim()
);

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
};
