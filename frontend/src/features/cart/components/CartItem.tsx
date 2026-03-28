import React from 'react';
import { getSupabaseStoragePublicUrl } from '../../../api/supabaseClient';
import { buildPublicAssetUrl } from '../../../config/clientEnv';
import type { CartItemWithFood } from '../types/cart.types';

interface CartItemProps {
  item: CartItemWithFood;
  onRemove: (cartItemId: string) => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onRemove,
  onUpdateQuantity,
}) => {
  const fallbackImageUrl = buildPublicAssetUrl('thumbnail.png');
  const imageUrl = item.food_items.image_url.startsWith('http')
    ? item.food_items.image_url
    : getSupabaseStoragePublicUrl('food-images', item.food_items.image_url) ||
      fallbackImageUrl;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest dark:bg-slate-800">
      <img
        src={imageUrl}
        alt={item.food_items.name}
        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-on-surface dark:text-white text-sm truncate">
          {item.food_items.name}
        </p>
        <p className="text-xs text-on-surface-variant mt-0.5">
          Quantity: {item.quantity}
        </p>
        <p className="text-sm font-bold text-primary mt-1">
          {`${(item.food_items.price * item.quantity).toLocaleString()} KRW`}
        </p>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-green-500 transition-colors"
          aria-label="Increase quantity"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
        <button
          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-500 transition-colors"
          aria-label="Decrease quantity"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <button
          onClick={() => onRemove(item.id)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
          aria-label="Remove from cart"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
};
