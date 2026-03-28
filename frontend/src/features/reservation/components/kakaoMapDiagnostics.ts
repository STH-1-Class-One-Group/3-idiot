import { isProductionBuild } from '../../../config/clientEnv';

export type KakaoMapFailureReason =
  | 'missing_key'
  | 'script_load_failed'
  | 'domain_not_allowed_or_network_blocked';

const getLocationContext = () => {
  if (typeof window === 'undefined') {
    return {
      origin: 'unknown',
      pathname: 'unknown',
    };
  }

  return {
    origin: window.location.origin,
    pathname: window.location.pathname,
  };
};

export const classifyKakaoMapFailure = (
  appKey: string,
  error?: ErrorEvent
): KakaoMapFailureReason => {
  if (!appKey) {
    return 'missing_key';
  }

  const eventType = error?.type?.toLowerCase();

  if (eventType && eventType !== 'error') {
    return 'script_load_failed';
  }

  return 'domain_not_allowed_or_network_blocked';
};

export const reportKakaoMapFailure = (
  componentName: string,
  appKey: string,
  error?: ErrorEvent
) => {
  const reason = classifyKakaoMapFailure(appKey, error);
  const location = getLocationContext();

  console.error(`[${componentName}] Kakao map loader failed`, {
    reason,
    keyPresent: Boolean(appKey),
    origin: location.origin,
    pathname: location.pathname,
    errorType: error?.type ?? 'unknown',
  });

  return reason;
};

export const getKakaoMapFallbackCopy = (reason: KakaoMapFailureReason) => {
  switch (reason) {
    case 'missing_key':
      return {
        title: 'Kakao map is unavailable in this build.',
        description:
          'Set REACT_APP_KAKAO_MAP_KEY before building the frontend.',
      };
    case 'script_load_failed':
      return {
        title: 'Map service is temporarily unavailable.',
        description:
          'The Kakao map script could not be loaded in this environment.',
      };
    case 'domain_not_allowed_or_network_blocked':
    default:
      return {
        title: 'Map service is unavailable in this environment.',
        description:
          'Check the Kakao JavaScript key, allowed domains, and current network access.',
      };
  }
};

export const getKakaoMapModalMessage = (
  reason: KakaoMapFailureReason
) => getKakaoMapFallbackCopy(reason).title;

export const getKakaoMapSupportHint = (reason: KakaoMapFailureReason) => {
  if (isProductionBuild) {
    return undefined;
  }

  switch (reason) {
    case 'missing_key':
      return 'Development hint: define REACT_APP_KAKAO_MAP_KEY and rebuild.';
    case 'script_load_failed':
      return 'Development hint: confirm the Kakao script can be requested from this browser session.';
    case 'domain_not_allowed_or_network_blocked':
    default:
      return 'Development hint: confirm the current origin is allowlisted in Kakao Developers.';
  }
};
