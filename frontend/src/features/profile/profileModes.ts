import { Profile, ProfileFormValues } from './types';

type ValidationErrors = Partial<Record<'nickname' | 'userType' | 'cadreCategory' | 'rank' | 'serviceTrack' | 'enlistmentDate', string>>;

abstract class ProfileMode {
  abstract readonly type: string;

  normalize(values: ProfileFormValues): ProfileFormValues {
    return values;
  }

  validate(values: ProfileFormValues, todayInputValue: string): ValidationErrors {
    if (!values.nickname.trim()) {
      return { nickname: '닉네임을 입력해주세요.' };
    }

    if (!values.userType) {
      return { userType: '회원 유형을 선택해주세요.' };
    }

    if (values.enlistmentDate && values.enlistmentDate > todayInputValue) {
      return { enlistmentDate: '입대일은 오늘 이후로 설정할 수 없습니다.' };
    }

    return {};
  }

  isProfileComplete(profile: Profile | null): boolean {
    return Boolean(profile?.profile_completed && profile?.user_type === this.type);
  }
}

class CivilianMode extends ProfileMode {
  readonly type = 'civilian';

  override normalize(values: ProfileFormValues): ProfileFormValues {
    return {
      ...values,
      cadreCategory: '',
      rank: '',
      unit: '',
      enlistmentDate: '',
      serviceTrack: '',
    };
  }
}

class ActiveEnlistedMode extends ProfileMode {
  readonly type = 'active_enlisted';

  override normalize(values: ProfileFormValues): ProfileFormValues {
    return {
      ...values,
      cadreCategory: '',
      rank: '',
    };
  }

  override validate(values: ProfileFormValues, todayInputValue: string): ValidationErrors {
    const baseErrors = super.validate(values, todayInputValue);
    if (Object.keys(baseErrors).length > 0) {
      return baseErrors;
    }

    if (!values.serviceTrack) {
      return { serviceTrack: '복무 유형을 선택해주세요.' };
    }

    if (!values.enlistmentDate) {
      return { enlistmentDate: '입대일을 입력해주세요.' };
    }

    return {};
  }

  override isProfileComplete(profile: Profile | null): boolean {
    return Boolean(
      super.isProfileComplete(profile) &&
      profile?.service_track &&
      profile?.enlistment_date
    );
  }
}

class ActiveCadreMode extends ProfileMode {
  readonly type = 'active_cadre';

  override normalize(values: ProfileFormValues): ProfileFormValues {
    return {
      ...values,
      serviceTrack: '',
    };
  }

  override validate(values: ProfileFormValues, todayInputValue: string): ValidationErrors {
    const baseErrors = super.validate(values, todayInputValue);
    if (Object.keys(baseErrors).length > 0) {
      return baseErrors;
    }

    if (!values.cadreCategory) {
      return { cadreCategory: '간부 유형을 선택해주세요.' };
    }

    if (!values.rank.trim()) {
      return { rank: '계급 또는 직급을 입력해주세요.' };
    }

    if (!values.enlistmentDate) {
      return { enlistmentDate: '임용일 또는 입대일을 입력해주세요.' };
    }

    return {};
  }

  override isProfileComplete(profile: Profile | null): boolean {
    return Boolean(
      super.isProfileComplete(profile) &&
      profile?.cadre_category &&
      profile?.rank &&
      profile?.enlistment_date
    );
  }
}

const CIVILIAN_MODE = new CivilianMode();
const ACTIVE_ENLISTED_MODE = new ActiveEnlistedMode();
const ACTIVE_CADRE_MODE = new ActiveCadreMode();

export const PROFILE_MODE_REGISTRY: Record<string, ProfileMode> = {
  [CIVILIAN_MODE.type]: CIVILIAN_MODE,
  [ACTIVE_ENLISTED_MODE.type]: ACTIVE_ENLISTED_MODE,
  [ACTIVE_CADRE_MODE.type]: ACTIVE_CADRE_MODE,
};

export const getProfileMode = (userType: string | null | undefined) =>
  (userType ? PROFILE_MODE_REGISTRY[userType] : undefined) ?? null;

export const isProfileSetupRequired = (profile: Profile | null) => {
  if (!profile) {
    return true;
  }

  const mode = getProfileMode(profile.user_type);
  if (!mode) {
    return true;
  }

  return !mode.isProfileComplete(profile);
};
