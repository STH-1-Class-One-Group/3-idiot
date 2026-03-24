import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Profile } from '../../components/common/ProfileSetupModal';
import { PostCard } from './components/PostCard';
import { Post, PostListResponse } from './types';

interface CommunityPageProps {
  user: User | null;
  profile: Profile | null;
}

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const PER_PAGE = 10;

const CATEGORY_TABS = [
  { key: 'all', label: '전체' },
  { key: 'general', label: '자유게시판' },
  { key: 'question', label: '질문게시판' },
  { key: 'info', label: '정보공유' },
];

export const CommunityPage: React.FC<CommunityPageProps> = ({ user, profile }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async (cat: string, p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), per_page: String(PER_PAGE) });
      if (cat !== 'all') params.append('category', cat);
      const res = await fetch(`${apiUrl}/api/v1/community/posts?${params}`);
      if (res.ok) {
        const data: PostListResponse = await res.json();
        setPosts(data.posts);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(selectedCategory, page);
  }, [selectedCategory, page, fetchPosts]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      {/* 페이지 헤더 */}
      <section className="mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 text-on-surface dark:text-white">
          커뮤니티
        </h1>
        <p className="text-on-surface-variant dark:text-slate-400 text-lg max-w-2xl leading-relaxed">
          군 생활의 정보와 경험을 자유롭게 나누는 공간입니다.
        </p>
      </section>

      {/* 게시글 컨테이너 */}
      <div className="bg-surface-container-low dark:bg-slate-900 rounded-xl p-6 md:p-10">
        {/* 상단: 카테고리 탭 + 글쓰기 버튼 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* 카테고리 탭 */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleCategoryChange(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  selectedCategory === tab.key
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-surface-container-high dark:bg-slate-700 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-highest dark:hover:bg-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 글쓰기 버튼 (로그인 + 프로필 있을 때만) */}
          {user && profile && (
            <button
              onClick={() => navigate('/Community/write')}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-primary/20 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              글쓰기
            </button>
          )}
        </div>

        {/* 게시글 목록 */}
        {isLoading ? (
          <div className="text-center py-20 text-on-surface-variant dark:text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 block animate-pulse">article</span>
            불러오는 중...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant dark:text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
            게시글이 없습니다. 첫 글을 남겨보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/Community/${post.id}`)}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-full bg-surface-container-high dark:bg-slate-700 text-on-surface-variant dark:text-slate-300 disabled:opacity-40 hover:bg-surface-container-highest dark:hover:bg-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <span className="text-sm font-medium text-on-surface-variant dark:text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-full bg-surface-container-high dark:bg-slate-700 text-on-surface-variant dark:text-slate-300 disabled:opacity-40 hover:bg-surface-container-highest dark:hover:bg-slate-600 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
