import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { getCartItems, removeFromCart, clearCart, updateQuantity, addToCart } from '../services/cartService';
import type { CartItemWithFood } from '../types/cart.types';

// 1. 설계도 정의
interface CartContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  cartItems: CartItemWithFood[];
  loading: boolean;
  error: string | null;
  totalPrice: number;
  totalCount: number;
  fetchCart: () => Promise<void>;
  handleAddToCart: (food_id: number) => Promise<void>;
  handleRemove: (id: string) => Promise<void>;
  handleClear: () => Promise<void>;
  handleUpdateQuantity: (id: string, q: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemWithFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // [데이터 새로고침 함수]
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getCartItems();
      // ⭐ 새 배열로 교체하여 리액트가 변화를 감지하게 함
      setCartItems([...items]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 앱 시작 시 초기 로드
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ⭐ [장바구니 담기] 실시간 반영의 핵심
  const handleAddToCart = async (food_id: number) => {
    try {
      setLoading(true);
      // 1. DB에 데이터 추가 완료 대기
      await addToCart({ food_id, quantity: 1 });
      
      // 2. 추가 성공 후, DB에서 최신 목록을 다시 긁어옴
      const freshItems = await getCartItems();
      
      // 3. ⭐ 리액트 상태(State)를 최신 데이터로 덮어씌움 -> 여기서 화면이 바뀜!
      setCartItems([...freshItems]);
      
      // 4. 사용자 경험을 위해 장바구니 창을 자동으로 열어줌
      setIsOpen(true);
      
      console.log("실시간 반영 완료:", freshItems.length);
    } catch (err: any) {
      alert("장바구니 담기 실패: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    try {
      await removeFromCart(cartItemId);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      if (newQuantity < 1) return;
      await updateQuantity(cartItemId, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      setCartItems([]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 실시간 합계/수량 계산
  const totalPrice = cartItems.reduce(
    (sum, item: CartItemWithFood) => sum + (item.food_items?.price || 0) * item.quantity,
    0
  );
  const totalCount = cartItems.reduce((sum, item: CartItemWithFood) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        cartItems,
        loading,
        error,
        totalPrice,
        totalCount,
        fetchCart,
        handleAddToCart,
        handleRemove,
        handleClear,
        handleUpdateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext는 CartProvider 안에서 사용해야 합니다.');
  return ctx;
}