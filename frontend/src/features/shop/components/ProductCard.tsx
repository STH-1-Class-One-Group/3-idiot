import React, { useState } from 'react';
import { getSupabaseStoragePublicUrl } from '../../../api/supabaseClient';
import { buildPublicAssetUrl } from '../../../config/clientEnv';
import type { Product } from '../types';
import { requestPayment } from '../../cart/services/paymentService';
import { useCartContext } from '../../cart/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [cartLoading, setCartLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(
    null
  );
  const { handleAddToCart } = useCartContext();

  const buyNow = () => {
    const orderName = product.name;
    const customerName = 'Customer';
    const successUrl = `${window.location.origin}/payment-success`;

    requestPayment(product.price, orderName, customerName, successUrl);
  };

  const fallbackImageUrl = buildPublicAssetUrl('thumbnail.png');
  const imageUrl = product.image_url.startsWith('http')
    ? product.image_url
    : getSupabaseStoragePublicUrl('food-images', product.image_url) ||
      fallbackImageUrl;

  const onAddToCartClick = async () => {
    setCartLoading(true);
    setFeedback(null);
    try {
      await handleAddToCart(product.id);

      setFeedback({ msg: 'Added to cart.', ok: true });
      setTimeout(() => setFeedback(null), 2000);
    } catch (err: any) {
      const isAuthError = err.message === '로그인이 필요합니다.';
      setFeedback({
        msg: isAuthError ? 'Please log in first.' : 'Something went wrong.',
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
        <h3 className="text-lg font-bold text-on-surface mb-2 tracking-tight">
          {product.name}
        </h3>
        <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
          Calories {product.calories} kcal
        </p>

        {feedback && (
          <p
            className={`text-xs mb-2 text-center font-medium ${
              feedback.ok ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {feedback.msg}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-lg font-extrabold text-primary">
            {`${product.price.toLocaleString()} KRW`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={buyNow}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-all"
              aria-label="Buy now"
            >
              <span className="material-symbols-outlined text-[20px]" translate="no">
                credit_card
              </span>
            </button>
            <button
              onClick={onAddToCartClick}
              disabled={cartLoading}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface hover:bg-primary hover:text-on-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add to cart"
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
