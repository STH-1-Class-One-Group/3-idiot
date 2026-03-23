// ─────────────────────────────────────────────────────────────
// CartContext.tsx
// 장바구니 Drawer의 열림/닫힘 상태를 "전역"으로 관리하는 파일.
//
// [왜 Context가 필요한가요?]
// 헤더의 아이콘(CartIcon)을 누르면 Drawer가 열려야 하는데,
// 이 둘은 컴포넌트 트리에서 서로 멀리 떨어져 있음.
// → props로 상태를 전달하면 코드가 복잡해짐 (props drilling 문제)
// → Context에 상태를 두면 어디서든 useCartContext()로 꺼내 쓸 수 있음.
// ─────────────────────────────────────────────────────────────
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

interface CartContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

// Context 초기값은 null. useCartContext()가 Provider 밖에서 쓰이면 에러.
const CartContext = createContext<CartContextType | null>(null);

/** App 최상단에서 이 Provider로 감싸주면 하위 모든 컴포넌트에서 사용 가능 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CartContext.Provider
      value={{
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/** Context를 꺼내 쓰는 커스텀 훅. Provider 밖에서 쓰면 즉시 에러를 알려줌. */
export function useCartContext(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext는 CartProvider 안에서 사용해야 합니다.');
  }
  return ctx;
}
