import React, { useState, useEffect } from 'react';
import { CalendarPopup } from './components/CalendarPopup';

interface MealItem {
  name: string;
  calorie: string; // "320 kcal" 형태로 들어옴
}

interface ParsedMeal {
  items: MealItem[];
  totalCal: number;
}

interface DayMealData {
  title: string;       // "어제", "오늘", "내일"
  shortDate: string;   // "05. 19"
  isToday: boolean;
  apiDate: string;
  dayOffset: number;
  breakfast: ParsedMeal;
  lunch:     ParsedMeal;
  dinner:    ParsedMeal;
  dailyTotal: number;
}

interface MealApiRow {
  dates: string;
  brst?: string;
  brst_cal?: string;
  lnch?: string;
  lunc?: string;
  lnch_cal?: string;
  lunc_cal?: string;
  dnr?: string;
  dinr?: string;
  dnr_cal?: string;
  dinr_cal?: string;
  sum_cal?: string;
}

interface MealApiResponse {
  success: boolean;
  date: string;
  data: MealApiRow[];
  is_fallback?: boolean;
}

const getDateInfo = (baseDate: Date, offset: number) => {
  const target = new Date(baseDate);
  target.setDate(target.getDate() + offset);
  
  const year = target.getFullYear();
  const monthStr = String(target.getMonth() + 1).padStart(2, '0');
  const dayStr = String(target.getDate()).padStart(2, '0');
  
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = days[target.getDay()];
  
  return {
    apiString: `${year}-${monthStr}-${dayStr}`, // "2024-05-19"
    displayString: `${year}-${monthStr}-${dayStr}(${dayName})`, // "2024-05-19(일)"
    shortDate: `${monthStr}. ${dayStr}` // "05. 19"
  };
};

const getFallbackData = (displayString: string) => [
  {"dates": displayString, "brst": "밥", "brst_cal": "374.13kcal", "lnch": "밥", "lnch_cal": "374.13kcal", "dnr": "밥", "dnr_cal": "374.13kcal", "sum_cal": "2961.19kcal"},
  {"dates": displayString, "brst": "참치 고추장찌개(05)(06)(09)(16)", "brst_cal": "148.73kcal", "lnch": "황태채미역국(05)(06)(16)", "lnch_cal": "41.88kcal", "dnr": "닭볶음탕(05)(15)", "dnr_cal": "451.14kcal", "sum_cal": "2961.19kcal"},
  {"dates": displayString, "brst": "새송이버섯야채볶음(05)(06)(10)(18)", "brst_cal": "111.5kcal", "lnch": "사천식캐슈넛멸치볶음(04)(05)", "lnch_cal": "102.06kcal", "dnr": "사골우거지국(02)(05)(06)(16)(18)", "dnr_cal": "164.58kcal", "sum_cal": "2961.19kcal"},
  {"dates": displayString, "brst": "계란말이(완)(01)(05)(12)", "brst_cal": "106kcal", "lnch": "고추장돼지불고기(완제품)(05)(10)", "lnch_cal": "482.33kcal", "dnr": "느타리버섯볶음(05)", "dnr_cal": "37.98kcal", "sum_cal": "2961.19kcal"},
  {"dates": displayString, "brst": "배추김치(수의계약)", "brst_cal": "13.8kcal", "lnch": "배추김치(수의계약)", "lnch_cal": "13.8kcal", "dnr": "토핑형발효유(02)(06)", "dnr_cal": "165kcal", "sum_cal": "2961.19kcal"},
  {"dates": displayString, "brst": "", "brst_cal": "", "lnch": "", "lnch_cal": "", "dnr": "배추김치", "dnr_cal": "0kcal", "sum_cal": "2961.19kcal"},
];

const processMealsAPI = (data: any[], _displayString: string): { b: ParsedMeal, l: ParsedMeal, d: ParsedMeal, dailyTotal: number } => {
  const cleanString = (str?: string) => str ? str.replace(/\([^)]*\)/g, '').trim() : '';

  let zeroCalCount = 0;
  let sumCalBase = 0;
  if (data.length > 0) {
    const firstSumCalStr = data[0].sum_cal || "0";
    sumCalBase = parseFloat(firstSumCalStr.replace(/[^0-9.]/g, '')) || 0;
  }

  const parseItemAndCalorie = (nameStr?: string, calStr?: string): MealItem | null => {
    const name = cleanString(nameStr);
    if (!name) return null;
    
    let calVal = calStr ? calStr.trim() : "";
    if (calVal === "" || calVal === "0kcal") {
      calVal = "53kcal";
      zeroCalCount++;
    }
    return { name, calorie: calVal };
  };

  const bItems: MealItem[] = [];
  const lItems: MealItem[] = [];
  const dItems: MealItem[] = [];

  data.forEach(item => {
    const b = parseItemAndCalorie(item.brst, item.brst_cal);
    if (b) bItems.push(b);
    
    const l = parseItemAndCalorie(item.lnch || item.lunc, item.lnch_cal || item.lunc_cal);
    if (l) lItems.push(l);
    
    const d = parseItemAndCalorie(item.dnr || item.dinr, item.dnr_cal || item.dinr_cal);
    if (d) dItems.push(d);
  });

  const getSum = (arr: MealItem[]) => {
    const sum = arr.reduce((acc, i) => acc + (parseFloat(i.calorie.replace(/[^0-9.]/g, '')) || 0), 0);
    return Math.round(sum * 100) / 100;
  };

  const dailyTotal = Math.round((sumCalBase + (zeroCalCount * 53)) * 100) / 100;

  return {
    b: { items: bItems, totalCal: getSum(bItems) },
    l: { items: lItems, totalCal: getSum(lItems) },
    d: { items: dItems, totalCal: getSum(dItems) },
    dailyTotal
  };
};

const getStartOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDayOffset = (targetDateString: string, referenceDate: Date) => {
  const [year, month, day] = targetDateString.split('-').map(Number);
  const target = new Date(year, (month || 1) - 1, day || 1);
  const startTarget = getStartOfDay(target).getTime();
  const startReference = getStartOfDay(referenceDate).getTime();
  return Math.round((startTarget - startReference) / (1000 * 60 * 60 * 24));
};

const getRelativeDayLabel = (dayOffset: number) => {
  if (dayOffset === 0) return '오늘';
  if (dayOffset === 1) return '내일';
  if (dayOffset === -1) return '어제';
  if (dayOffset > 1) return `${dayOffset}일 후`;
  return `${Math.abs(dayOffset)}일 전`;
};

const createDayMealData = (
  apiDate: string,
  parsed: { b: ParsedMeal; l: ParsedMeal; d: ParsedMeal; dailyTotal: number },
  referenceDate: Date
): DayMealData => {
  const [year, month, day] = apiDate.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  const monthStr = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  const dayOffset = getDayOffset(apiDate, referenceDate);

  return {
    title: getRelativeDayLabel(dayOffset),
    shortDate: `${monthStr}. ${dayStr}`,
    isToday: dayOffset === 0,
    apiDate,
    dayOffset,
    breakfast: parsed.b,
    lunch: parsed.l,
    dinner: parsed.d,
    dailyTotal: parsed.dailyTotal,
  };
};

const getDatePrefix = (value: string) => {
  const matched = value.match(/\d{4}-\d{2}-\d{2}/);
  return matched ? matched[0] : '';
};

export const MealPage: React.FC = () => {
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [mealDays, setMealDays] = useState<DayMealData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DayMealData[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('');

  // 현재 기준 날짜(Header)
  const currentInfo = getDateInfo(baseDate, 0);
  const headerDateStr = `${baseDate.getFullYear()}. ${currentInfo.shortDate}`; 
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  const normalizedSearchQuery = searchQuery.trim();

  const fetchMealDayData = async (dateString: string, referenceDate: Date) => {
    const info = getDateInfo(referenceDate, getDayOffset(dateString, referenceDate));
    let finalData: MealApiRow[] = [];
    let isFallback = false;

    try {
      const res = await fetch(`${apiUrl}/api/v1/meals/${dateString}`);
      if (!res.ok) throw new Error('API Fail');
      const result: MealApiResponse = await res.json();
      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('No Data');
      }
      finalData = result.data;
      isFallback = Boolean(result.is_fallback);
    } catch (err) {
      console.warn(`[MealPage] 날짜 ${dateString} 식단 로드 실패, Fallback 데이터 사용`);
      finalData = getFallbackData(info.displayString) as MealApiRow[];
      isFallback = true;
    }

    const parsed = processMealsAPI(finalData, info.displayString);

    return {
      dayData: createDayMealData(dateString, parsed, referenceDate),
      isFallback,
    };
  };

  useEffect(() => {
    const fetchAllMeals = async () => {
      setIsLoading(true);
      
      const offsets = [-1, 0, 1]; // 어제, 오늘, 내일
      
      const promises = offsets.map(async (offset) => {
        const info = getDateInfo(baseDate, offset);
        const { dayData } = await fetchMealDayData(info.apiString, baseDate);
        return {
          ...dayData,
          title: offset === -1 ? '어제' : offset === 0 ? '오늘' : '내일',
          shortDate: info.shortDate,
          isToday: offset === 0,
          dayOffset: offset,
        } as DayMealData;
      });

      const results = await Promise.all(promises);
      setMealDays(results);
      setIsLoading(false);
    };

    fetchAllMeals();
  }, [baseDate.getTime()]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (!trimmedQuery) {
      setSearchResults([]);
      setSearchFeedback('');
      setIsSearchLoading(false);
      return;
    }

    let isActive = true;

    const searchMeals = async () => {
      setIsSearchLoading(true);
      setSearchFeedback('');

      try {
        const response = await fetch(`${apiUrl}/api/v1/meals`);
        if (!response.ok) {
          throw new Error('Failed to fetch all meals');
        }

        const result: MealApiResponse = await response.json();
        const groupedMeals = new Map<string, MealApiRow[]>();

        result.data.forEach((item) => {
          const datePrefix = getDatePrefix(item.dates);
          if (!datePrefix) {
            return;
          }

          const existingItems = groupedMeals.get(datePrefix) || [];
          existingItems.push(item);
          groupedMeals.set(datePrefix, existingItems);
        });

        const today = new Date();
        const matches = Array.from(groupedMeals.entries())
          .map(([dateString, rows]) => {
            const parsed = processMealsAPI(rows, dateString);
            const dayData = createDayMealData(dateString, parsed, today);
            const searchableText = [
              ...parsed.b.items.map((item) => item.name),
              ...parsed.l.items.map((item) => item.name),
              ...parsed.d.items.map((item) => item.name),
            ]
              .join(' ')
              .toLowerCase();

            return {
              dayData,
              searchableText,
            };
          })
          .filter(({ searchableText }) => searchableText.includes(trimmedQuery))
          .sort((left, right) => {
            const leftDistance = Math.abs(left.dayData.dayOffset);
            const rightDistance = Math.abs(right.dayData.dayOffset);

            if (leftDistance !== rightDistance) {
              return leftDistance - rightDistance;
            }

            if (left.dayData.dayOffset >= 0 && right.dayData.dayOffset < 0) {
              return -1;
            }

            if (left.dayData.dayOffset < 0 && right.dayData.dayOffset >= 0) {
              return 1;
            }

            return left.dayData.dayOffset - right.dayData.dayOffset;
          })
          .map(({ dayData }) => dayData);

        if (!isActive) {
          return;
        }

        setSearchResults(matches);
        if (matches.length === 0) {
          setSearchFeedback('검색한 식단과 일치하는 날짜가 없습니다.');
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error('[MealPage] failed to search meals:', error);
        setSearchResults([]);
        setSearchFeedback('식단 검색 중 오류가 발생했습니다.');
      } finally {
        if (isActive) {
          setIsSearchLoading(false);
        }
      }
    };

    void searchMeals();

    return () => {
      isActive = false;
    };
  }, [apiUrl, searchQuery]);

  const renderMealBox = (mealCode: 'brst' | 'lnch' | 'dnr', parsed: ParsedMeal, isToday: boolean) => {
    let icon = '';
    let label = '';
    
    if (mealCode === 'brst') {
      icon = 'wb_twilight';
      label = '조식';
    } else if (mealCode === 'lnch') {
      icon = 'light_mode';
      label = '중식';
    } else {
      icon = 'dark_mode';
      label = '석식';
    }

    return (
      <div className={`bg-surface-container-lowest dark:bg-slate-900 p-6 rounded-xl space-y-4 ${isToday ? 'shadow-lg shadow-primary/5 border-l-4 border-primary' : ''}`}>
        <div className="flex justify-between items-center">
          <div className={`flex items-center space-x-2 font-semibold text-xs uppercase tracking-widest ${isToday ? 'text-primary dark:text-blue-400' : 'text-primary dark:text-blue-400'}`}>
            <span className="material-symbols-outlined text-sm" translate="no">{icon}</span>
            <span>{label}</span>
          </div>
          <span className="text-[10px] text-tertiary-container dark:text-slate-300 bg-tertiary-fixed dark:bg-slate-800 px-2 py-0.5 rounded font-bold">
            {parsed.totalCal.toLocaleString()} kcal
          </span>
        </div>
        <ul className={`space-y-2 text-sm ${isToday ? 'grid grid-cols-1 gap-1 text-on-surface dark:text-slate-200' : 'text-secondary dark:text-slate-400'}`}>
          {parsed.items.length > 0 ? (
            parsed.items.map((item, idx) => {
              const itemClasses = isToday 
                ? "flex justify-between items-center py-1.5 border-b border-surface-container-low dark:border-slate-800 font-medium" 
                : "flex justify-between items-center";
              return (
                <li key={idx} className={itemClasses}>
                  <span>{item.name}</span>
                  <span className={isToday ? 'text-primary dark:text-blue-400 font-medium' : 'text-on-surface-variant/70 dark:text-slate-500'}>{item.calorie}</span>
                </li>
              );
            })
          ) : (
            <li>식단 없음</li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Universal Search Bar (Centered at top) - Optional UI from target code */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400" translate="no">search</span>
          <input 
            type="text" 
            className="w-full bg-surface-container-low dark:bg-slate-800 border-none rounded-full py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/60 dark:placeholder:text-slate-500 text-on-surface dark:text-white" 
            placeholder="식단, 재료 또는 영양 정보를 검색하세요"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        {normalizedSearchQuery ? (
          <div className="mt-3 px-2 text-sm text-on-surface-variant dark:text-slate-400">
            {isSearchLoading
              ? '식단 검색 중...'
              : searchResults.length > 0
                ? `${searchResults.length}개의 일정 식단을 찾았습니다.`
                : searchFeedback}
          </div>
        ) : null}
      </div>

      {/* Date Navigation Header */}
      <header className="mb-12 flex flex-col items-center justify-center space-y-6">
        <div className="flex items-center space-x-8 bg-surface-container-lowest dark:bg-slate-900 px-6 py-3 rounded-full shadow-sm border border-transparent dark:border-slate-800">
          <button 
            className="material-symbols-outlined text-primary dark:text-blue-400 hover:bg-surface-container-low dark:hover:bg-slate-800 p-2 rounded-full transition-all active:scale-90" 
            translate="no"
            onClick={() => setBaseDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1))}
          >
            arrow_back
          </button>
          <button 
            className="group flex items-center space-x-3 focus:outline-none"
            onClick={() => setIsCalendarOpen(true)}
          >
            <span className="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
              {headerDateStr}
            </span>
            <span className="material-symbols-outlined text-primary dark:text-blue-400 group-hover:translate-y-0.5 transition-transform" translate="no">calendar_month</span>
          </button>
          <button 
            className="material-symbols-outlined text-primary dark:text-blue-400 hover:bg-surface-container-low dark:hover:bg-slate-800 p-2 rounded-full transition-all active:scale-90" 
            translate="no"
            onClick={() => setBaseDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1))}
          >
            arrow_forward
          </button>
        </div>
        <p className="text-on-surface-variant dark:text-slate-400 font-medium text-sm">병영 식단표 상세 보기</p>
      </header>

      {/* Meal Grid Layout */}
      {normalizedSearchQuery ? (
        isSearchLoading ? (
          <div className="flex justify-center items-center h-48">
            <span className="text-on-surface-variant dark:text-slate-400">검색 결과를 불러오는 중입니다...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {searchResults.map((dayData) => (
              <section
                key={dayData.apiDate}
                className={`space-y-6 relative transition-opacity ${!dayData.isToday ? 'opacity-90 hover:opacity-100' : ''}`}
              >
                {dayData.isToday && (
                  <div className="absolute -inset-4 border-2 border-primary/20 dark:border-blue-400/20 rounded-3xl pointer-events-none hidden md:block"></div>
                )}

                <div className="text-center mb-4 relative">
                  {dayData.isToday && (
                    <span className="bg-primary dark:bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full absolute -top-8 left-1/2 -translate-x-1/2 font-bold uppercase tracking-tighter">Current Day</span>
                  )}
                  <h2 className={`text-xl font-extrabold ${dayData.isToday ? 'text-primary dark:text-blue-400' : 'text-on-surface-variant dark:text-slate-300'}`}>
                    {dayData.title} ({dayData.shortDate})
                  </h2>
                  <div className="mt-1 font-bold text-sm text-on-surface-variant dark:text-slate-400">
                    총 <span className="text-primary dark:text-blue-400">{dayData.dailyTotal.toLocaleString()}</span> kcal
                  </div>
                </div>

                {renderMealBox('brst', dayData.breakfast, dayData.isToday)}
                {renderMealBox('lnch', dayData.lunch, dayData.isToday)}
                {renderMealBox('dnr', dayData.dinner, dayData.isToday)}
              </section>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-48">
            <span className="text-on-surface-variant dark:text-slate-400">
              {searchFeedback || '검색 결과가 없습니다.'}
            </span>
          </div>
        )
      ) : isLoading ? (
        <div className="flex justify-center items-center h-48">
          <span className="text-on-surface-variant dark:text-slate-400">식단 정보를 불러오는 중입니다...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mealDays.map((dayData, i) => {
            const isToday = dayData.isToday;
            
            return (
              <section 
                key={i} 
                className={`space-y-6 relative transition-opacity ${!isToday ? 'opacity-80 md:opacity-60 hover:opacity-100' : ''}`}
              >
                {isToday && (
                  <div className="absolute -inset-4 border-2 border-primary/20 dark:border-blue-400/20 rounded-3xl pointer-events-none hidden md:block"></div>
                )}
                
                <div className="text-center mb-4 relative">
                  {isToday && (
                    <span className="bg-primary dark:bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full absolute -top-8 left-1/2 -translate-x-1/2 font-bold uppercase tracking-tighter">Current Day</span>
                  )}
                  <h2 className={`text-xl font-extrabold ${isToday ? 'text-primary dark:text-blue-400' : 'text-on-surface-variant dark:text-slate-300'}`}>
                    {dayData.title} ({dayData.shortDate})
                  </h2>
                  <div className="mt-1 font-bold text-sm text-on-surface-variant dark:text-slate-400">
                    총 <span className="text-primary dark:text-blue-400">{dayData.dailyTotal.toLocaleString()}</span> kcal
                  </div>
                </div>

                {/* Breakfast */}
                {renderMealBox('brst', dayData.breakfast, isToday)}
                
                {/* Lunch */}
                {renderMealBox('lnch', dayData.lunch, isToday)}
                
                {/* Dinner */}
                {renderMealBox('dnr', dayData.dinner, isToday)}
              </section>
            );
          })}
        </div>
      )}

      {/* 달력 팝업 컴포넌트 */}
      <CalendarPopup 
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={baseDate}
        onSelectDate={(date) => setBaseDate(date)}
      />
    </div>
  );
};
