import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import VegBadge from '../components/VegBadge';

export const CartPage = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tax,
    deliveryFee,
    grandTotal,
    totalItemsCount,
  } = useCart();

  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FAF8F5] py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 text-center border border-[#E8E2D8] shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-[#F5F0E8] text-[#EA580C] mx-auto flex items-center justify-center mb-5">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#132E20] mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Looks like you haven't selected any culinary treats yet. Explore our mouthwatering menu to start your feast!
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-[#EA580C] hover:bg-[#D04F1C] text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">
            Order Review
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#132E20] mt-1">
            Shopping Cart ({totalItemsCount} items)
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Selected Dishes
              </span>
              <button
                onClick={clearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-[#F0EAE1]">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Food Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 bg-[#F5F0E8] border border-[#E8E2D8]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <VegBadge isVegetarian={item.is_vegetarian} size="sm" />
                        <span className="text-[10px] uppercase font-bold text-gray-400">
                          {item.category}
                        </span>
                      </div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-[#132E20] truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#EA580C]">
                        ₹{item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                    {/* Stepper */}
                    <div className="flex items-center bg-[#F7F3EB] border border-[#E5DFD5] rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-white text-[#132E20] hover:bg-[#EA580C] hover:text-white transition-colors flex items-center justify-center shadow-xs"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-[#132E20]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-white text-[#132E20] hover:bg-[#EA580C] hover:text-white transition-colors flex items-center justify-center shadow-xs"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-sm sm:text-base font-bold text-[#132E20]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Delete Item */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 rounded-xl transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#F0EAE1]">
              <Link
                to="/menu"
                className="text-xs font-bold text-[#132E20] hover:text-[#EA580C] transition-colors"
              >
                ← Continue Adding More Dishes
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#132E20] pb-4 border-b border-[#F0EAE1]">
              Bill Summary
            </h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#132E20]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span>GST / Government Taxes</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-500">
                    5%
                  </span>
                </span>
                <span className="font-semibold text-[#132E20]">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Standard Delivery Fee</span>
                <span className="font-semibold text-[#132E20]">₹{deliveryFee.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-[#F0EAE1] flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-[#132E20] block">
                    Grand Total
                  </span>
                  <span className="text-[11px] text-gray-400">Inclusive of all taxes</span>
                </div>
                <span className="font-serif text-2xl font-black text-[#EA580C]">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Delivery Guarantee */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 leading-relaxed">
                <p className="font-bold text-[#132E20]">Safe & Hygienic Delivery</p>
                <p className="mt-0.5">Sealed packaging, contactless delivery option available upon request.</p>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#EA580C] hover:bg-[#D04F1C] text-white font-bold text-base shadow-lg transition-all active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
