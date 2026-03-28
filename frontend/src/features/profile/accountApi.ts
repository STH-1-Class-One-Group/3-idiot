import { buildApiUrl } from '../../api/apiBaseUrl';
import {
  getSupabaseAccessToken,
  getSupabaseConfigErrorMessage,
  hasSupabaseConfig,
} from '../../api/supabaseClient';

export const ACCOUNT_DELETION_CONFIRMATION_TEXT = 'DELETE';

export const deleteCurrentAccount = async (confirmationText: string) => {
  if (!hasSupabaseConfig) {
    throw new Error(getSupabaseConfigErrorMessage());
  }

  const accessToken = await getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error('Could not verify your login session. Please sign in again.');
  }

  const response = await fetch(buildApiUrl('/api/v1/auth/me/delete'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      confirmation_text: confirmationText,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail =
      payload && typeof payload === 'object' && 'detail' in payload
        ? String((payload as { detail?: string }).detail || '')
        : '';

    throw new Error(detail || 'Could not delete the account. Please try again.');
  }

  return response.json();
};
