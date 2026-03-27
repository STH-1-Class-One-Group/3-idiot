const DEFAULT_API_BASE_URL = 'http://localhost:8000';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const rawApiBaseUrl = (process.env.REACT_APP_API_URL || '').trim();

export const hasConfiguredApiBaseUrl = Boolean(rawApiBaseUrl);

export const apiBaseUrl = trimTrailingSlashes(rawApiBaseUrl || DEFAULT_API_BASE_URL);

export const isUsingApiBaseUrlFallback = !hasConfiguredApiBaseUrl;

export const getApiRuntimeErrorMessage = (resourceLabel: string) => {
  if (!hasConfiguredApiBaseUrl) {
    return process.env.NODE_ENV === 'production'
      ? `프론트 환경변수 REACT_APP_API_URL이 설정되지 않아 ${resourceLabel}를 불러올 수 없습니다.`
      : `API 서버에 연결할 수 없어 ${resourceLabel}를 불러오지 못했습니다. 백엔드 서버(${DEFAULT_API_BASE_URL})가 실행 중인지 확인해 주세요.`;
  }

  return `${resourceLabel}를 제공하는 API 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.`;
};

export const getApiResponseErrorMessage = (status: number, resourceLabel: string) => {
  if (status >= 500) {
    return `${resourceLabel}를 불러오는 중 서버 오류가 발생했습니다.`;
  }

  if (status === 404) {
    return `${resourceLabel}를 찾을 수 없습니다.`;
  }

  if (status === 401 || status === 403) {
    return `${resourceLabel}에 접근할 권한이 없습니다.`;
  }

  return `${resourceLabel}를 불러오지 못했습니다.`;
};

export const isNetworkFetchError = (error: unknown) =>
  error instanceof TypeError && /fetch|network/i.test(error.message);

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
};
