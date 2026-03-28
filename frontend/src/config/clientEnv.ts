const readTrimmedEnv = (value: string | undefined) => value?.trim() ?? '';

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const normalizeUrlEnv = (value: string) => {
  if (!value || value === '.') {
    return '';
  }

  return trimTrailingSlashes(value);
};

export const clientEnv = Object.freeze({
  nodeEnv: readTrimmedEnv(process.env.NODE_ENV) || 'development',
  publicUrl: normalizeUrlEnv(readTrimmedEnv(process.env.PUBLIC_URL)),
  apiBaseUrl: normalizeUrlEnv(readTrimmedEnv(process.env.REACT_APP_API_URL)),
  siteUrl: normalizeUrlEnv(readTrimmedEnv(process.env.REACT_APP_SITE_URL)),
  supabaseUrl: normalizeUrlEnv(readTrimmedEnv(process.env.REACT_APP_SUPABASE_URL)),
  supabaseAnonKey: readTrimmedEnv(process.env.REACT_APP_SUPABASE_ANON_KEY),
  recruitmentServiceKey: readTrimmedEnv(process.env.REACT_APP_DATA_SERVICE_KEY),
  kakaoMapKey: readTrimmedEnv(process.env.REACT_APP_KAKAO_MAP_KEY),
});

export const isProductionBuild = clientEnv.nodeEnv === 'production';

export const buildPublicAssetUrl = (assetPath: string) => {
  const normalizedAssetPath = assetPath.replace(/^\/+/, '');

  return clientEnv.publicUrl
    ? `${clientEnv.publicUrl}/${normalizedAssetPath}`
    : `/${normalizedAssetPath}`;
};
