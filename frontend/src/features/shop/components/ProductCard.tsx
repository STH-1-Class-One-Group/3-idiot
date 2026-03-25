import React, { useState } from 'react';
import { Product } from '../hooks/useProducts';
import { supabase } from '../../../api/supabaseClient';
import { addToCart } from '../../cart/services/cartService';
import { useCartContext } from '../../cart/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [cartLoading, setCartLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  
  // ⭐ 핵심: fetchCartItems 대신, 실제 Context에 있는 이름인 fetchCart를 가져옵니다.
  const { fetchCart } = useCartContext();

  // 이미지 URL 처리
  const imageUrl = product.image_url.startsWith('http')
    ? product.image_url
    : supabase.storage.from('food-images').getPublicUrl(product.image_url).data.publicUrl;

  const handleAddToCart = async () => {
    setCartLoading(true);
    setFeedback(null);
    try {
      // 1. DB에 저장
      await addToCart({ food_id: product.id });

      // 2. ⭐ 저장 성공 후, Context의 fetchCart를 실행해서 화면을 갱신합니다.
      if (fetchCart) {
        await fetchCart();
      }

      setFeedback({ msg: '✅ 장바구니에 담겼습니다!', ok: true });
      setTimeout(() => setFeedback(null), 2000);
    } catch (err: any) {
      const isAuthError = err.message === '로그인이 필요합니다.';
      setFeedback({
        msg: isAuthError ? '🔒 로그인 후 이용해 주세요.' : '❌ 오류가 발생했습니다.',
        ok: false,
      });
      setTimeout(() => setFeedback(null), 2500);
    } finally {
      setCartLoading(false);
    }
  };

  return (
    <div className="group bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0_12px_40px_rgba(27,28,28,0.06)] transition-all duration-300">
      <div className="aspect-square bg-surface-dim relative overflow-hidden">
        <img
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={imageUrl}
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-on-surface mb-2 tracking-tight">{product.name}</h3>
        <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">칼로리: {product.calories} kcal</p>

        {feedback && (
          <p className={`text-xs mb-2 text-center font-medium ${feedback.ok ? 'text-green-600' : 'text-red-500'}`}>
            {feedback.msg}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold text-primary">₩ {product.price.toLocaleString()}</span>
          <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-all">
              <span className="material-symbols-outlined text-[20px]" translate="no">credit_card</span>
            </button>
            <button
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="장바구니에 담기"
            >
              <span className="material-symbols-outlined text-[20px]" translate="no">
                {cartLoading ? 'hourglass_empty' : 'shopping_cart'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};