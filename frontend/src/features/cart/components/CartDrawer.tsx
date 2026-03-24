// ─────────────────────────────────────────────────────────────
// CartDrawer.tsx
// 장바구니 사이드바의 "내용" 전체를 담당하는 컴포넌트.
// - 헤더(제목 + 닫기 버튼)
// - 아이템 목록 (CartItem 반복 렌더)
// - 하단 합계 금액 + 주문 버튼 + 비우기 버튼
//
// [왜 CartModal과 분리하나요?]
// CartModal은 "오버레이+슬라이드 애니메이션" 껍데기만 담당합니다.
// CartDrawer는 그 안에 들어가는 "실제 내용"입니다.
// 껍데기(모달)와 내용(드로어)을 분리하면, 나중에 모달 없이 페이지로 바꿔도
// CartDrawer 내용은 그대로 재사용할 수 있습니다.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useCartContext } from '../context/CartContext';
import { useCart } from '../hooks/useCart';
import { CartItem } from './CartItem';

export const CartDrawer: React.FC = () => {
  const { closeCart } = useCartContext();
  const {
    cartItems,
    loading,
    error,
    totalPrice,
    totalCount,
    handleRemove,
    handleClear,
    handleUpdateQuantity,
  } = useCart();

  return (
    // 내부 콘텐츠는 세로 방향 flex로 구성:
    // [헤더] | [스크롤 가능한 목록] | [합계+버튼]
    <div className="flex flex-col h-full">

      {/* ── 헤더 ── */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <h2 className="text-lg font-bold text-on-surface dark:text-white">
          🛒 장바구니
          {totalCount > 0 && (
            <span className="ml-2 text-sm font-medium text-primary">
              ({totalCount}개)
            </span>
          )}
        </h2>
        <button
          onClick={closeCart}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high dark:hover:bg-slate-700 transition-colors"
          aria-label="장바구니 닫기"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
            close
          </span>
        </button>
      </div>

      {/* ── 아이템 목록 (스크롤) ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-on-surface-variant py-10">불러오는 중...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-10">{error}</p>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-6xl mb-3">
              shopping_cart
            </span>
            <p className="text-sm">장바구니가 비어 있습니다.</p>
          </div>
        ) : (
          // CartItem에게 item 데이터와 삭제 콜백을 props로 전달
          // → CartItem은 "어떻게 보여줄지"만, 삭제 처리는 여기서
          cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onRemove={handleRemove}
              onUpdateQuantity={handleUpdateQuantity}
            />
          ))
        )}
      </div>

      {/* ── 하단: 합계 + 버튼 (아이템 있을 때만) ── */}
      {cartItems.length > 0 && (
        <div className="p-5 border-t border-slate-200 dark:border-slate-700 space-y-3 flex-shrink-0">
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">합계</span>
            <span className="text-xl font-extrabold text-on-surface dark:text-white">
              ₩ {totalPrice.toLocaleString()}
            </span>
          </div>
          <button
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
            onClick={() => alert('주문 기능은 준비 중입니다!')}
          >
            주문하기
          </button>
          <button
            className="w-full py-2 rounded-xl text-sm text-on-surface-variant hover:text-red-500 transition-colors"
            onClick={handleClear}
          >
            장바구니 비우기
          </button>
        </div>
      )}
    </div>
  );
};
