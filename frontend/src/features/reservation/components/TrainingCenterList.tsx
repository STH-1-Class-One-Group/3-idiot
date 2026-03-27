import React, { useEffect, useRef, useState, useMemo } from 'react';
import { TrainingCenter } from '../data/trainingCenters';
import { TrainingCenterCard } from './TrainingCenterCard';

interface TrainingCenterListProps {
  centers: TrainingCenter[];
  isLoading: boolean;
  onPreviewClick?: (center: TrainingCenter) => void;
  onDetailClick?: (center: TrainingCenter) => void;
  highlightedCenterId?: string | null;
}

export const TrainingCenterList: React.FC<TrainingCenterListProps> = ({
  centers,
  isLoading,
  onPreviewClick,
  onDetailClick,
  highlightedCenterId,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCenters = useMemo(() => {
    if (!searchQuery.trim()) return centers;
    const q = searchQuery.trim().toLowerCase();
    return centers.filter((center) => {
      const aliases = center.aliases.join(' ').toLowerCase();
      const zones = center.zones.join(' ').toLowerCase();
      return (
        center.name.toLowerCase().includes(q) ||
        aliases.includes(q) ||
        center.address.toLowerCase().includes(q) ||
        zones.includes(q)
      );
    });
  }, [centers, searchQuery]);

  useEffect(() => {
    if (!highlightedCenterId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-center-id="${highlightedCenterId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedCenterId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold tracking-tight text-on-surface dark:text-white">주변 훈련장 목록</h3>
        <span className="text-sm font-medium text-on-surface-variant dark:text-slate-400">총 {filteredCenters.length}개 결과</span>
      </div>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-xl" translate="no">search</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="훈련장 이름 또는 주소 검색"
          className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 rounded-lg text-sm text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 hover:text-on-surface dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-lg" translate="no">close</span>
          </button>
        )}
      </div>
      <div ref={listRef} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-on-surface-variant dark:text-slate-400">
            <span className="material-symbols-outlined animate-spin mr-2" translate="no">progress_activity</span>
            훈련장 정보를 불러오는 중...
          </div>
        ) : filteredCenters.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant dark:text-slate-400">
            <span className="material-symbols-outlined text-4xl opacity-40 block mb-2" translate="no">search_off</span>
            <p className="text-sm">{searchQuery ? '검색 결과가 없습니다.' : '해당 지역에 훈련장이 없습니다.'}</p>
          </div>
        ) : (
          filteredCenters.map((center) => (
            <TrainingCenterCard
              key={center.id}
              center={center}
              onPreviewClick={onPreviewClick}
              onDetailClick={onDetailClick}
              isHighlighted={highlightedCenterId === center.id}
            />
          ))
        )}
      </div>
    </div>
  );
};
