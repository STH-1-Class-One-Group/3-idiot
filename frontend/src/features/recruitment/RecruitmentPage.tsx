import React, { useEffect, useMemo, useState } from 'react';

import { RecruitmentNotice, recruitmentNotices } from './recruitmentData';

const itemsPerPage = 8;

const processSteps = [
  {
    id: 'apply',
    icon: 'edit_square',
    title: '지원서 접수',
    description: '희망 군별 공고를 선택하고 온라인으로 지원서를 제출합니다.',
  },
  {
    id: 'review',
    icon: 'fact_check',
    title: '서류 및 적성 평가',
    description: '제출 서류 검토와 필기, 적성검사 일정을 진행합니다.',
  },
  {
    id: 'interview',
    icon: 'groups',
    title: '면접 및 체력 검정',
    description: '직무 적합성과 군별 기준에 맞는 면접 및 체력평가를 받습니다.',
  },
  {
    id: 'result',
    icon: 'military_tech',
    title: '최종 합격 발표',
    description: '합격자 안내와 입영, 교육 일정이 순차적으로 공지됩니다.',
  },
];

const branchStyles: Record<string, string> = {
  육군: 'bg-blue-600 text-white',
  해군: 'bg-cyan-600 text-white',
  공군: 'bg-indigo-600 text-white',
  해병대: 'bg-rose-600 text-white',
};

const getSearchableTerms = (notice: RecruitmentNotice) => [
  notice.title,
  notice.branch,
  notice.category,
  notice.highlight,
  notice.summary,
  ...notice.tags,
];

const getSuggestionPool = () => {
  const seen = new Set<string>();
  const suggestions: string[] = [];

  recruitmentNotices.forEach((notice) => {
    notice.tags.forEach((tag) => {
      if (seen.has(tag)) {
        return;
      }

      seen.add(tag);
      suggestions.push(tag);
    });
  });

  return suggestions;
};

const suggestionPool = getSuggestionPool();

export const RecruitmentPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return suggestionPool
      .filter((item) => item.toLowerCase().includes(normalizedQuery))
      .slice(0, 5);
  }, [normalizedQuery]);

  const filteredNotices = useMemo(() => {
    if (selectedSuggestion) {
      const normalizedSuggestion = selectedSuggestion.toLowerCase();

      return recruitmentNotices.filter((notice) =>
        getSearchableTerms(notice).some((term) => term.toLowerCase().includes(normalizedSuggestion))
      );
    }

    if (!normalizedQuery) {
      return recruitmentNotices;
    }

    return recruitmentNotices.filter((notice) =>
      getSearchableTerms(notice).some((term) => term.toLowerCase().includes(normalizedQuery))
    );
  }, [normalizedQuery, selectedSuggestion]);

  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / itemsPerPage));
  const visibleNotices = filteredNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSuggestion]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <div className="w-full">
      <section className="relative overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_34%),linear-gradient(135deg,#f8fbff_0%,#eef4ff_44%,#ffffff_100%)] px-6 py-10 shadow-[0_24px_80px_rgba(30,64,175,0.12)] ring-1 ring-blue-100 md:px-10 lg:px-12 lg:py-14 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.26),_transparent_28%),linear-gradient(135deg,#0f172a_0%,#172554_48%,#0f172a_100%)] dark:ring-blue-900/60">
        <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-blue-200/45 blur-3xl dark:bg-blue-500/20" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-400/10" />

        <div className="relative grid gap-10 lg:grid-cols-[1.35fr_0.95fr] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.32em] text-blue-700 dark:text-blue-300">
              Recruitment
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 lg:text-6xl dark:text-white">
              인재 채용
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 lg:text-lg dark:text-slate-300">
              군별 모집 공고를 한 곳에서 비교하고, 관심 직무를 바로 좁혀볼 수 있도록 정리한
              채용 페이지입니다. 검색어로 관련 전형을 찾고, 선택한 조건에 맞는 공고만 빠르게
              확인할 수 있습니다.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600 dark:text-blue-300">
                  Search
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  모집 공고 검색
                </h2>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                총 30건
              </span>
            </div>

            <label className="block">
              <span className="sr-only">모집 검색</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-blue-400 focus-within:bg-white dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-blue-400">
                <span
                  className="material-symbols-outlined text-slate-400 dark:text-slate-500"
                  translate="no"
                >
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSelectedSuggestion('');
                  }}
                  placeholder="예: 육군, 공군, 군무원, 드론"
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>
            </label>

            {suggestions.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Related
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => {
                    const isActive = selectedSuggestion === suggestion;

                    return (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setSelectedSuggestion(suggestion);
                          setSearchQuery(suggestion);
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {suggestion}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  현재 결과
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {filteredNotices.length}건
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  선택 필터
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                  {selectedSuggestion || '전체 보기'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 rounded-[30px] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 md:p-8 dark:bg-slate-950 dark:ring-slate-900">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
              Open Notices
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              모집 공고 목록
            </h2>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {selectedSuggestion
              ? `${selectedSuggestion} 관련 공고를 보여주고 있습니다.`
              : '군별, 직무별 공고를 페이지 단위로 탐색할 수 있습니다.'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {visibleNotices.map((notice) => (
            <article
              key={notice.id}
              className="group overflow-hidden rounded-[26px] border border-slate-100 bg-slate-50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(37,99,235,0.12)] dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={notice.imageUrl}
                  alt={notice.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${branchStyles[notice.branch]}`}
                  >
                    {notice.branch}
                  </span>
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 backdrop-blur dark:bg-slate-950/80 dark:text-slate-200">
                    {notice.category}
                  </span>
                </div>
              </div>

              <div className="flex min-h-[260px] flex-col p-5">
                <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <span>마감 {notice.deadline}</span>
                  <span>{notice.schedule.split('/')[0].trim()}</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {notice.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {notice.summary}
                </p>
                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm dark:bg-slate-800 dark:text-blue-300">
                  {notice.highlight}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {notice.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-auto inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-600 dark:bg-white dark:text-slate-950 dark:hover:bg-blue-300"
                >
                  자세히 보기
                </button>
              </div>
            </article>
          ))}
        </div>

        {visibleNotices.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center text-sm font-medium text-slate-500 dark:border-slate-700 dark:text-slate-400">
            일치하는 모집 공고가 없습니다. 다른 검색어를 입력하거나 제안을 선택해 보세요.
          </div>
        ) : null}

        {filteredNotices.length > 0 ? (
          <div className="mt-12 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined" translate="no">
                chevron_left
              </span>
            </button>
            <div className="text-sm font-bold tracking-[0.24em] text-slate-700 dark:text-slate-200">
              {currentPage} / {totalPages}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined" translate="no">
                chevron_right
              </span>
            </button>
          </div>
        ) : null}
      </section>

      <section className="mt-12 rounded-[30px] bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_52%,#ecfeff_100%)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 md:p-8 dark:bg-[linear-gradient(135deg,#0f172a_0%,#111827_52%,#082f49_100%)] dark:ring-slate-900">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600 dark:text-blue-300">
              Process
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              선발 절차 안내
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            군별 전형은 세부 일정이 다르지만, 대부분 지원서 접수부터 최종 합격 발표까지 비슷한
            흐름으로 진행됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <span className="material-symbols-outlined" translate="no">
                    {step.icon}
                  </span>
                </div>
                <span className="text-sm font-black tracking-[0.2em] text-slate-300 dark:text-slate-700">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
