// ─────────────────────────────────────────────────────────────
// useCart.ts
// 장바구니 "데이터 상태"를 관리하는 커스텀 훅.
//
// [훅을 따로 만드는 이유]
// 컴포넌트 안에 useState + useEffect + 서비스 호출을 다 넣으면
// 파일이 너무 복잡해짐.
// → 훅으로 분리하면 컴포넌트는 "UI 렌더링"만, 훅은 "데이터 처리"만 담당.
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { getCartItems, removeFromCart, clearCart, updateQuantity } from '../services/cartService';
import type { CartItemWithFood } from '../types/cart.types';
import { useCartContext } from '../context/CartContext';

export function useCart() {
  const { isOpen } = useCartContext();
  const [cartItems, setCartItems] = useState<CartItemWithFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drawer가 열릴 때마다 최신 데이터를 가져옴
  // useCallback: 함수를 메모이제이션해서 불필요한 재생성 방지
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getCartItems();
      setCartItems(items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 마운트 시 1회 + Drawer가 열릴 때마다 최신 데이터 동기화
  // - 마운트 시: 헤더 배지에 실제 수량을 보여주기 위함
  // - isOpen 변화 시: Drawer를 열면 항상 최신 목록을 가져옴
  useEffect(() => {
    fetchCart(); // 마운트 시 1회
  }, [fetchCart]);

  useEffect(() => {
    if (isOpen) {
      fetchCart(); // Drawer 열릴 때 재동기화
    }
  }, [isOpen, fetchCart]);

  // 아이템 삭제 후 목록 새로고침
  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      // 삭제 후 상태에서도 즉시 제거 (UX 향상 — 깜빡임 없음)
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 전체 비우기
  const handleClear = async () => {
    try {
      await clearCart();
      setCartItems([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 수량 업데이트
  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      await updateQuantity(cartItemId, newQuantity);
      // 업데이트 후 상태에서도 즉시 변경 (UX 향상)
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 총 가격 계산 (렌더링 때마다 재계산하지 않도록 여기서 처리)
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.food_items.price * item.quantity,
    0
  );

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    loading,
    error,
    totalPrice,
    totalCount,
    handleRemove,
    handleClear,
    handleUpdateQuantity,
    refetch: fetchCart,
  };
}
