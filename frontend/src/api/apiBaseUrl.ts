import { clientEnv, isProductionBuild } from '../config/clientEnv';

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

export const hasConfiguredApiBaseUrl = Boolean(clientEnv.apiBaseUrl);

export const apiBaseUrl = trimTrailingSlashes(
  clientEnv.apiBaseUrl || DEFAULT_API_BASE_URL
);

export const isUsingApiBaseUrlFallback = !hasConfiguredApiBaseUrl;

export const getApiRuntimeErrorMessage = (resourceLabel: string) => {
  if (!hasConfiguredApiBaseUrl) {
    return isProductionBuild
      ? `REACT_APP_API_URL is not configured, so ${resourceLabel} is unavailable in this build.`
      : `Could not reach the API server for ${resourceLabel}. Confirm that ${DEFAULT_API_BASE_URL} is running.`;
  }

  return `Could not reach the API server for ${resourceLabel}. Please try again.`;
};

export const getApiResponseErrorMessage = (
  status: number,
  resourceLabel: string
) => {
  if (status >= 500) {
    return `The server failed while loading ${resourceLabel}.`;
  }

  if (status === 404) {
    return `Could not find ${resourceLabel}.`;
  }

  if (status === 401 || status === 403) {
    return `You do not have permission to access ${resourceLabel}.`;
  }

  return `Could not load ${resourceLabel}.`;
};

export const isNetworkFetchError = (error: unknown) =>
  error instanceof TypeError && /fetch|network/i.test(error.message);

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
};
