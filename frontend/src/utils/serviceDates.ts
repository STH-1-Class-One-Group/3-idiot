const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const USER_TYPE_OPTIONS = [
  { value: 'civilian', label: '일반인' },
  { value: 'active_service', label: '현역 군인' },
] as const;

export const SERVICE_TRACK_CONFIG = {
  army_active: {
    label: '육군 현역',
    durationMonths: 18,
  },
  air_force_active: {
    label: '공군 현역',
    durationMonths: 21,
  },
  social_service: {
    label: '공익근무요원(사회복무요원)',
    durationMonths: 21,
  },
  industrial_service_active: {
    label: '산업체요원(산업기능요원·현역입영대상자)',
    durationMonths: 34,
  },
  industrial_service_supplementary: {
    label: '산업체요원(산업기능요원·사회복무요원소집대상자)',
    durationMonths: 23,
  },
} as const;

export type UserType = (typeof USER_TYPE_OPTIONS)[number]['value'];
export type ServiceTrack = keyof typeof SERVICE_TRACK_CONFIG;

export const SERVICE_TRACK_OPTIONS = Object.entries(SERVICE_TRACK_CONFIG).map(([value, config]) => ({
  value: value as ServiceTrack,
  label: config.label,
  durationLabel: `${config.durationMonths}개월`,
}));

export interface ServiceTimeline {
  hasEnlistmentDate: boolean;
  hasServiceTrack: boolean;
  enlistmentLabel: string;
  dischargeLabel: string;
  dDayLabel: string;
  progressPercent: number;
  helperText: string;
  serviceLabel: string;
  serviceDurationLabel: string;
}

const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}. ${month}. ${day}`;
};

const diffInDays = (later: Date, earlier: Date) =>
  Math.floor((toDateOnly(later).getTime() - toDateOnly(earlier).getTime()) / ONE_DAY_MS);

export const isActiveServiceUser = (userType: string | null | undefined) => userType === 'active_service';

export const getUserTypeLabel = (userType: string | null | undefined) =>
  USER_TYPE_OPTIONS.find((option) => option.value === userType)?.label ?? '미설정';

export const getServiceTrackLabel = (serviceTrack: string | null | undefined) =>
  serviceTrack && serviceTrack in SERVICE_TRACK_CONFIG
    ? SERVICE_TRACK_CONFIG[serviceTrack as ServiceTrack].label
    : '-';

export const calculateServiceTimeline = (
  userType: string | null | undefined,
  serviceTrack: string | null | undefined,
  enlistmentDate: string | null | undefined,
  now = new Date()
): ServiceTimeline => {
  if (!userType) {
    return {
      hasEnlistmentDate: false,
      hasServiceTrack: false,
      enlistmentLabel: '-',
      dischargeLabel: '-',
      dDayLabel: '회원유형 필요',
      progressPercent: 0,
      helperText: '회원가입 또는 마이페이지에서 회원 유형을 먼저 선택해주세요.',
      serviceLabel: '-',
      serviceDurationLabel: '-',
    };
  }

  if (!isActiveServiceUser(userType)) {
    return {
      hasEnlistmentDate: false,
      hasServiceTrack: false,
      enlistmentLabel: '-',
      dischargeLabel: '-',
      dDayLabel: '해당 없음',
      progressPercent: 0,
      helperText: '일반인 회원은 군 복무일 계산이 적용되지 않습니다.',
      serviceLabel: '일반인 회원',
      serviceDurationLabel: '-',
    };
  }

  if (!serviceTrack || !(serviceTrack in SERVICE_TRACK_CONFIG)) {
    return {
      hasEnlistmentDate: Boolean(enlistmentDate),
      hasServiceTrack: false,
      enlistmentLabel: enlistmentDate ? formatDisplayDate(parseIsoDate(enlistmentDate)) : '-',
      dischargeLabel: '-',
      dDayLabel: '복무유형 필요',
      progressPercent: 0,
      helperText: '현역 군인 회원은 복무 유형을 설정해야 전역일 계산을 표시할 수 있습니다.',
      serviceLabel: '-',
      serviceDurationLabel: '-',
    };
  }

  const selectedService = SERVICE_TRACK_CONFIG[serviceTrack as ServiceTrack];

  if (!enlistmentDate) {
    return {
      hasEnlistmentDate: false,
      hasServiceTrack: true,
      enlistmentLabel: '-',
      dischargeLabel: '-',
      dDayLabel: '입대일 필요',
      progressPercent: 0,
      helperText: '현역 군인 회원은 입대일을 설정해야 전역일 계산을 표시할 수 있습니다.',
      serviceLabel: selectedService.label,
      serviceDurationLabel: `${selectedService.durationMonths}개월`,
    };
  }

  const enlistment = parseIsoDate(enlistmentDate);
  if (Number.isNaN(enlistment.getTime())) {
    return {
      hasEnlistmentDate: false,
      hasServiceTrack: true,
      enlistmentLabel: '-',
      dischargeLabel: '-',
      dDayLabel: '날짜 오류',
      progressPercent: 0,
      helperText: '저장된 입대일 형식이 올바르지 않습니다.',
      serviceLabel: selectedService.label,
      serviceDurationLabel: `${selectedService.durationMonths}개월`,
    };
  }

  const discharge = new Date(
    enlistment.getFullYear(),
    enlistment.getMonth() + selectedService.durationMonths,
    enlistment.getDate()
  );
  discharge.setDate(discharge.getDate() - 1);

  const today = toDateOnly(now);
  const totalDays = diffInDays(discharge, enlistment) + 1;
  const servedDays =
    today < enlistment ? 0 : Math.min(totalDays, diffInDays(today, enlistment) + 1);
  const remainingDays = today > discharge ? 0 : diffInDays(discharge, today);
  const progressPercent = totalDays > 0 ? (servedDays / totalDays) * 100 : 0;

  return {
    hasEnlistmentDate: true,
    hasServiceTrack: true,
    enlistmentLabel: formatDisplayDate(enlistment),
    dischargeLabel: formatDisplayDate(discharge),
    dDayLabel: today > discharge ? '전역 완료' : `D-${remainingDays}`,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    helperText: `${selectedService.label} 기준 ${selectedService.durationMonths}개월 복무기간으로 자동 계산됩니다.`,
    serviceLabel: selectedService.label,
    serviceDurationLabel: `${selectedService.durationMonths}개월`,
  };
};
