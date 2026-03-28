import { clientEnv, isProductionBuild } from '../../config/clientEnv';

const PRODUCTION_SITE_URL = 'https://teamc-defense-industry.pages.dev';
const POST_LOGIN_PATH_KEY = 'auth.return_to';

const normalizeRelativePath = (value: string) => {
  if (!value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
};

export const getCurrentRelativePath = () => {
  if (typeof window === 'undefined') {
    return '/';
  }

  return normalizeRelativePath(
    `${window.location.pathname}${window.location.search}${window.location.hash}` || '/'
  );
};

export const getCanonicalSiteOrigin = () => {
  if (clientEnv.siteUrl) {
    return clientEnv.siteUrl;
  }

  if (isProductionBuild) {
    return PRODUCTION_SITE_URL;
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return PRODUCTION_SITE_URL;
};

export const getOAuthRedirectTo = () => `${getCanonicalSiteOrigin()}/`;

export const persistPostLoginPath = (path = getCurrentRelativePath()) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(POST_LOGIN_PATH_KEY, normalizeRelativePath(path));
};

export const consumePostLoginPath = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.sessionStorage.getItem(POST_LOGIN_PATH_KEY);
  window.sessionStorage.removeItem(POST_LOGIN_PATH_KEY);

  if (!value) {
    return null;
  }

  return normalizeRelativePath(value);
};
