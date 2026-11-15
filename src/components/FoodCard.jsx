import React, { useState } from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import VegBadge from './VegBadge';

export const FoodCard = ({ item }) => {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const [imageError, setImageError] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#E8E2D8] hover:border-[#EA580C]/40 hover:shadow-xl transition-all duration-300">
      {/* Food Photography */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-[#F5F0E8]">
        <img
          src={imageError || !item.image_url ? fallbackImage : item.image_url}
          alt={item.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="p-1.5 bg-white/95 backdrop-blur-xs rounded-lg shadow-sm">
            <VegBadge isVegetarian={item.is_vegetarian} size="md" />
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold tracking-wide uppercase bg-[#132E20]/90 backdrop-blur-xs text-white rounded-full shadow-sm">
            {item.category}
          </span>
        </div>

        {!item.is_available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="px-4 py-1.5 bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h3 className="font-serif text-xl font-bold text-[#132E20] group-hover:text-[#EA580C] transition-colors leading-snug">
            {item.name}
          </h3>
          <span className="text-lg font-bold text-[#EA580C] shrink-0 font-sans">
            ₹{Number(item.price).toFixed(2)}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-5 flex-1">
          {item.description || 'Prepared fresh with premium ingredients and traditional spices.'}
        </p>

        {/* Action Button */}
        <div className="pt-2 border-t border-[#F0EAE1]">
          {!item.is_available ? (
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-gray-100 text-gray-400 font-medium text-sm cursor-not-allowed text-center"
            >
              Currently Unavailable
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center justify-between bg-[#F7F3EB] border border-[#E5DFD5] rounded-xl p-1">
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-[#132E20] hover:bg-[#EA580C] hover:text-white transition-colors shadow-xs active:scale-95"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm text-[#132E20] px-3">
                {quantity} in cart
              </span>
              <button
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-[#132E20] hover:bg-[#EA580C] hover:text-white transition-colors shadow-xs active:scale-95"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item, 1)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#132E20] text-white hover:bg-[#EA580C] font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
