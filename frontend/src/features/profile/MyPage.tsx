import React, { useEffect, useMemo, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { ProfileAvatar } from '../../components/common/ProfileAvatar';
import {
  calculateServiceTimeline,
  getCadreCategoryLabel,
  getUserTypeLabel,
  isCadreUser,
  isEnlistedUser,
} from '../../utils/serviceDates';
import { Profile, ProfileFormValues } from './types';
import {
  getProviderLabel,
  getTodayInputValue,
  isNicknameAvailable,
  PROFILE_CADRE_CATEGORY_OPTIONS,
  PROFILE_RANKS,
  PROFILE_SERVICE_TRACK_OPTIONS,
  PROFILE_USER_TYPE_OPTIONS,
  saveProfile,
} from './profileFormUtils';
import { getProfileMode } from './profileModes';

interface MyPageProps {
  user: User | null;
  profile: Profile | null;
  isProfileLoading: boolean;
  onProfileUpdated: (profile: Profile) => void;
}

const formatDateLabel = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const MyPage: React.FC<MyPageProps> = ({ user, profile, isProfileLoading, onProfileUpdated }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfileFormValues>({
    nickname: profile?.nickname ?? '',
    userType: profile?.user_type ?? '',
    cadreCategory: profile?.cadre_category ?? '',
    rank: profile?.rank ?? '',
    unit: profile?.unit ?? '',
    enlistmentDate: profile?.enlistment_date ?? '',
    serviceTrack: profile?.service_track ?? '',
  });
  const [nicknameError, setNicknameError] = useState('');
  const [userTypeError, setUserTypeError] = useState('');
  const [cadreCategoryError, setCadreCategoryError] = useState('');
  const [rankError, setRankError] = useState('');
  const [serviceTrackError, setServiceTrackError] = useState('');
  const [enlistmentDateError, setEnlistmentDateError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const todayInputValue = getTodayInputValue();
  const providerLabel = getProviderLabel(user?.app_metadata?.provider);
  const displayName = profile?.nickname || (user?.user_metadata?.full_name as string) || user?.email || '사용자';
  const isEnlisted = isEnlistedUser(form.userType);
  const isCadre = isCadreUser(form.userType);
  const serviceTimeline = calculateServiceTimeline(form.userType, form.serviceTrack, form.enlistmentDate, form.cadreCategory);

  useEffect(() => {
    if (!user && !isProfileLoading) navigate('/');
  }, [user, isProfileLoading, navigate]);

  useEffect(() => {
    setForm({
      nickname: profile?.nickname ?? '',
      userType: profile?.user_type ?? '',
      cadreCategory: profile?.cadre_category ?? '',
      rank: profile?.rank ?? '',
      unit: profile?.unit ?? '',
      enlistmentDate: profile?.enlistment_date ?? '',
      serviceTrack: profile?.service_track ?? '',
    });
    setNicknameError('');
    setUserTypeError('');
    setCadreCategoryError('');
    setRankError('');
    setServiceTrackError('');
    setEnlistmentDateError('');
    setSaveError('');
    setSaveSuccess('');
  }, [profile]);

  const meta = useMemo(
    () => [
      ['로그인 계정', user?.email ?? '이메일 정보 없음'],
      ['로그인 제공자', providerLabel],
      ['회원 유형', getUserTypeLabel(form.userType)],
      ['간부 유형', isCadre ? getCadreCategoryLabel(form.cadreCategory) : '-'],
      ['가입일', formatDateLabel(user?.created_at)],
    ],
    [form.cadreCategory, form.userType, isCadre, providerLabel, user?.created_at, user?.email]
  );

  const setField = (key: keyof ProfileFormValues, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaveError('');
    setSaveSuccess('');
    if (key === 'nickname') setNicknameError('');
    if (key === 'userType') setUserTypeError('');
    if (key === 'cadreCategory') setCadreCategoryError('');
    if (key === 'rank') setRankError('');
    if (key === 'serviceTrack') setServiceTrackError('');
    if (key === 'enlistmentDate') setEnlistmentDateError('');
  };

  const applyUserType = (userType: string) => {
    setForm((current) => ({
      ...current,
      userType,
      cadreCategory: userType === 'active_cadre' ? current.cadreCategory : '',
      rank: userType === 'active_cadre' ? current.rank : '',
      unit: userType === 'civilian' ? '' : current.unit,
      enlistmentDate: userType === 'civilian' ? '' : current.enlistmentDate,
      serviceTrack: userType === 'active_enlisted' ? current.serviceTrack : '',
    }));
    setUserTypeError('');
    setCadreCategoryError('');
    setRankError('');
    setServiceTrackError('');
    setEnlistmentDateError('');
  };

  const checkNickname = async () => {
    if (!user || !form.nickname.trim()) return;
    setIsCheckingNickname(true);
    const available = await isNicknameAvailable(form.nickname, user.id);
    setIsCheckingNickname(false);
    if (!available) setNicknameError('이미 사용 중인 닉네임입니다.');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const mode = getProfileMode(form.userType);
    const errors = mode?.validate(form, todayInputValue) ?? { userType: '회원 유형을 선택해주세요.' };

    setNicknameError(errors.nickname ?? '');
    setUserTypeError(errors.userType ?? '');
    setCadreCategoryError(errors.cadreCategory ?? '');
    setRankError(errors.rank ?? '');
    setServiceTrackError(errors.serviceTrack ?? '');
    setEnlistmentDateError(errors.enlistmentDate ?? '');

    if (nicknameError || Object.keys(errors).length > 0) return;

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const available = await isNicknameAvailable(form.nickname, user.id);
      if (!available) return setNicknameError('이미 사용 중인 닉네임입니다.');

      if (!mode) {
        setUserTypeError('회원 유형을 선택해주세요.');
        return;
      }

      const payload = mode.normalize(form);
      const { data, error } = await saveProfile(user.id, payload);
      if (error) {
        if (error.code === '23505') setNicknameError('이미 사용 중인 닉네임입니다.');
        else setSaveError('프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }

      onProfileUpdated(data as Profile);
      setSaveSuccess('개인정보가 저장되었습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;
  if (isProfileLoading) return <div className="flex min-h-[50vh] items-center justify-center">프로필 정보를 불러오는 중입니다.</div>;

  return (
    <div className="relative isolate space-y-10">
      <section className="overflow-hidden rounded-[34px] border border-slate-200/70 bg-white/90 shadow-[0_30px_120px_-58px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/85">
        <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">My Page</span>
            <div className="space-y-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">내 계정과 사용자 유형을 관리하세요.</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 md:text-base">일반인, 현역군인(병), 현역간부를 구분해 관리합니다. 병은 복무 유형과 입대일, 간부는 간부 유형과 계급/직급을 기준으로 관리합니다.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60"><div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">User Type</div><div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{getUserTypeLabel(form.userType)}</div></div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60"><div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">D-Day</div><div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{serviceTimeline.dDayLabel}</div></div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60"><div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Progress</div><div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{serviceTimeline.progressPercent.toFixed(1)}%</div></div>
            </div>
          </div>
          <div className="rounded-[30px] border border-slate-200/70 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center gap-4">
              <ProfileAvatar nickname={displayName} rank={isCadre ? form.rank : null} avatar_url={profile?.avatar_url} containerClassName="h-20 w-20 overflow-hidden rounded-[24px] ring-4 ring-white dark:ring-slate-900" fallbackClassName="bg-gradient-to-br from-sky-600 via-blue-600 to-cyan-500 text-white text-2xl font-black" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Active Identity</p>
                <h2 className="mt-1 truncate text-2xl font-bold text-slate-900 dark:text-white">{displayName}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{getUserTypeLabel(form.userType)}{isCadre && form.cadreCategory ? ` · ${getCadreCategoryLabel(form.cadreCategory)}` : ''}{isCadre && form.rank ? ` · ${form.rank}` : ''}{form.unit ? ` · ${form.unit}` : ''}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {meta.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{label}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_16px_70px_-50px_rgba(15,23,42,0.55)] dark:border-slate-800/80 dark:bg-slate-900/80">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Service Timeline</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60"><div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">복무/직군</div><div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{serviceTimeline.serviceLabel}</div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">기준 {serviceTimeline.serviceDurationLabel}</p></div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60"><div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">입대일/임용일</div><div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{serviceTimeline.enlistmentLabel}</div></div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60"><div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">전역일</div><div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{serviceTimeline.dischargeLabel}</div></div>
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60"><div className="flex items-end justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">진행률</div><div className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{serviceTimeline.progressPercent.toFixed(1)}%</div></div><div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200">{serviceTimeline.dDayLabel}</div></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-[linear-gradient(90deg,#0ea5e9,#2563eb,#14b8a6)]" style={{ width: `${serviceTimeline.progressPercent.toFixed(1)}%` }} /></div><p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{serviceTimeline.helperText}</p></div>
            </div>
          </div>
        </aside>

        <div className="rounded-[30px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_20px_90px_-56px_rgba(15,23,42,0.55)] dark:border-slate-800/80 dark:bg-slate-900/85 md:p-8">
          <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-6 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Profile Editor</span>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">개인정보 수정</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">회원 유형별로 필요한 정보만 입력받도록 구성했습니다.</p>
              </div>
              <button type="button" onClick={() => profile && setForm({ nickname: profile.nickname ?? '', userType: profile.user_type ?? '', cadreCategory: profile.cadre_category ?? '', rank: profile.rank ?? '', unit: profile.unit ?? '', enlistmentDate: profile.enlistment_date ?? '', serviceTrack: profile.service_track ?? '' })} className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-sky-200 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-sky-500/30 dark:hover:text-sky-200">변경 취소</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">회원 유형 <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {PROFILE_USER_TYPE_OPTIONS.map((option) => (
                  <button key={option.value} type="button" onClick={() => applyUserType(option.value)} className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${form.userType === option.value ? 'border-sky-400 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-200' : 'border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200'}`}>{option.label}</button>
                ))}
              </div>
              {userTypeError && <p className="text-xs text-red-500">{userTypeError}</p>}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">닉네임 <span className="text-red-500">*</span></label>
                <input type="text" value={form.nickname} onChange={(event) => setField('nickname', event.target.value)} onBlur={checkNickname} maxLength={20} placeholder="사용할 닉네임을 입력하세요" className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-sky-500" />
                {isCheckingNickname && <p className="text-xs text-slate-500 dark:text-slate-400">중복 확인 중...</p>}
                {nicknameError && <p className="text-xs text-red-500">{nicknameError}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">이메일</label>
                <input type="text" value={user.email ?? ''} readOnly className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" />
              </div>
            </div>

            {isEnlisted && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">복무 유형 <span className="text-red-500">*</span></label>
                  <select value={form.serviceTrack} onChange={(event) => setField('serviceTrack', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-sky-500"><option value="">선택하세요</option>{PROFILE_SERVICE_TRACK_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label} · {option.durationLabel}</option>)}</select>
                  {serviceTrackError && <p className="text-xs text-red-500">{serviceTrackError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">입대일 <span className="text-red-500">*</span></label>
                  <input type="date" value={form.enlistmentDate} max={todayInputValue} onChange={(event) => setField('enlistmentDate', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-sky-500" />
                  {enlistmentDateError && <p className="text-xs text-red-500">{enlistmentDateError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">소속부대 <span className="text-slate-400 font-normal">(선택)</span></label>
                  <input type="text" value={form.unit} onChange={(event) => setField('unit', event.target.value)} maxLength={50} placeholder="예: 육군 제00사단" className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-sky-500" />
                </div>
              </div>
            )}

            {isCadre && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">간부 유형 <span className="text-red-500">*</span></label>
                  <select value={form.cadreCategory} onChange={(event) => setField('cadreCategory', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-sky-500"><option value="">선택하세요</option>{PROFILE_CADRE_CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                  {cadreCategoryError && <p className="text-xs text-red-500">{cadreCategoryError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">계급/직급 <span className="text-red-500">*</span></label>
                  <select value={form.rank} onChange={(event) => setField('rank', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-sky-500"><option value="">선택하세요</option>{PROFILE_RANKS.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                  {rankError && <p className="text-xs text-red-500">{rankError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">임용일/입대일 <span className="text-red-500">*</span></label>
                  <input type="date" value={form.enlistmentDate} max={todayInputValue} onChange={(event) => setField('enlistmentDate', event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-sky-500" />
                  {enlistmentDateError && <p className="text-xs text-red-500">{enlistmentDateError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">소속부대/기관 <span className="text-slate-400 font-normal">(선택)</span></label>
                  <input type="text" value={form.unit} onChange={(event) => setField('unit', event.target.value)} maxLength={50} placeholder="예: 공군 제00비행단 / 국방부" className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-sky-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950/60 dark:text-white dark:focus:border-sky-500" />
                </div>
              </div>
            )}

            {(saveError || saveSuccess) && <div className={`rounded-2xl px-4 py-3 text-sm ${saveError ? 'border border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'}`}>{saveError || saveSuccess}</div>}

            <div className="flex flex-col gap-4 border-t border-slate-200/70 pt-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">저장 후 헤더 프로필과 대시보드 계산 카드가 현재 회원 유형 기준으로 즉시 갱신됩니다.</p>
              <button type="submit" disabled={isSaving || !form.nickname.trim() || !!nicknameError || !!userTypeError || !!cadreCategoryError || !!rankError || !!serviceTrackError || !!enlistmentDateError} className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#0ea5e9,#2563eb,#14b8a6)] px-7 py-3 text-sm font-bold text-white shadow-[0_18px_40px_-24px_rgba(37,99,235,0.8)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? '저장 중...' : '개인정보 저장'}</button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
