// ─────────────────────────────────────────────────────────────
// CartIcon.tsx
// 헤더에 들어갈 장바구니 아이콘 버튼.
// useCart로 totalCount를 받아 배지(숫자 뱃지)로 표시하는 것만 담당.
//
// [왜 분리하나요?]
// Header.tsx는 이미 충분히 복잡합니다. 장바구니 아이콘의 "몇 개 담겼나?"
// 로직까지 Header에 넣으면 파일이 비대해집니다.
// CartIcon이 이 책임 하나만 가지면, Header는 그냥 <CartIcon />만 붙이면 됩니다.
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { useCartContext } from '../context/CartContext';
import { useCart } from '../hooks/useCart';

export const CartIcon: React.FC = () => {
  const { openCart } = useCartContext(); // Drawer 열기 함수
  const { totalCount } = useCart();     // 담긴 총 수량

  return (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="장바구니 열기"
    >
      <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all">
        shopping_cart
      </span>

      {/* 수량 배지: 1개 이상 담겼을 때만 표시 */}
      {totalCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[10px] font-bold bg-blue-600 text-white rounded-full flex items-center justify-center">
          {totalCount > 9 ? '9+' : totalCount}
        </span>
      )}
    </button>
  );
};
