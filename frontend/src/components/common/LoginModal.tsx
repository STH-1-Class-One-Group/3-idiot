import React from 'react';
import { supabase } from '../../api/supabaseClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type OAuthProvider = 'google' | 'kakao' | 'naver';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleLogin = async (provider: OAuthProvider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'],
        options:
          provider === 'google'
            ? {
                queryParams: {
                  prompt: 'select_account',
                },
              }
            : undefined,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(`濡쒓렇???붿껌 以?臾몄젣媛 諛쒖깮?덉뒿?덈떎: ${error.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-surface-container-lowest p-8 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface dark:text-white">濡쒓렇??/ ?뚯썝媛??</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <span className="material-symbols-outlined translate-y-[2px]">close</span>
          </button>
        </div>

        <p className="mb-8 text-center text-sm text-on-surface-variant dark:text-slate-400">
          Modern Sentinel??濡쒓렇?명븯??<br />
          留욎땄??援??앺솢 愿由??쒕퉬?ㅻ? ?댁슜?대낫?몄슂.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleLogin('kakao')}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#FEE500] px-4 py-3 font-bold text-[#000000] transition-colors hover:bg-[#FEE500]/90"
          >
            移댁뭅?ㅽ넚?쇰줈 怨꾩냽?섍린
          </button>

          <button
            onClick={() => handleLogin('naver')}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#03C75A] px-4 py-3 font-bold text-white transition-colors hover:bg-[#03C75A]/90"
          >
            ?ㅼ씠踰꾨줈 怨꾩냽?섍린
          </button>

          <button
            onClick={() => handleLogin('google')}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Google濡?怨꾩냽?섍린
          </button>
        </div>

        <div className="mt-8 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          濡쒓렇????Modern Sentinel??
          <button type="button" className="mx-1 underline hover:text-primary">
            ?댁슜?쎄?
          </button>
          諛?<br />
          <button type="button" className="underline hover:text-primary">
            媛쒖씤?뺣낫泥섎━諛⑹묠
          </button>
          ???숈쓽?섍쾶 ?⑸땲??
        </div>
      </div>
    </div>
  );
};
