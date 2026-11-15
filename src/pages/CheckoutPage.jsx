import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  Banknote,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Receipt,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

export const CheckoutPage = () => {
  const { profile } = useAuth();
  const { items, subtotal, tax, deliveryFee, grandTotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const paymentMethod = 'cash_on_delivery'; // As required

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5] py-16 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-[#E8E2D8] shadow-sm">
          <UtensilsCrossed className="w-12 h-12 text-[#EA580C] mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-[#132E20] mb-2">
            No items to checkout
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Your cart is empty. Please add delicious items from our menu before proceeding.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#EA580C] text-white font-bold text-sm"
          >
            Explore Menu
          </Link>
        </div>
      </div>
    );
  }

  // Handle Order Placement using public.place_order RPC
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 10) {
      setError('Please provide a complete delivery address (street, building, landmark).');
      return;
    }

    setLoading(true);

    try {
      // Format items array for the place_order RPC
      const formattedItems = items.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      }));

      const basePayload = {
        p_customer_name: customerName.trim(),
        p_phone: phone.trim(),
        p_delivery_address: deliveryAddress.trim(),
        p_payment_method: paymentMethod,
        p_items: formattedItems,
      };

      // Call the secure RPC function. First attempt with 5 parameters.
      let { data, error: rpcError } = await supabase.rpc('place_order', basePayload);

      // If schema cache mismatch requires the default parameter explicitly:
      if (rpcError && (rpcError.message?.includes('schema cache') || rpcError.code === 'PGRST202')) {
        const retry = await supabase.rpc('place_order', {
          ...basePayload,
          p_delivery_fee: 30.00,
        });
        data = retry.data;
        rpcError = retry.error;
      }

      if (rpcError) {
        throw rpcError;
      }

      // Order created successfully!
      setPlacedOrder(data);
      clearCart();
    } catch (err) {
      console.error('Order placement failed:', err);
      setError(
        err.message || 'Failed to place your order. Please verify your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Order Success Screen
  if (placedOrder) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E2D8] shadow-lg text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">
              Order Confirmed
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#132E20] mt-1">
              Thank You For Your Order!
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Our kitchen has received your ticket and is preparing your meal with care.
            </p>
          </div>

          {/* Receipt Card */}
          <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-left space-y-3 text-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Order ID
              </span>
              <span className="font-mono font-bold text-xs text-[#132E20]">
                {placedOrder.order_id}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#132E20]">₹{Number(placedOrder.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (5%)</span>
              <span className="font-semibold text-[#132E20]">₹{Number(placedOrder.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-[#132E20]">₹{Number(placedOrder.delivery_fee).toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-[#E8E2D8] flex justify-between items-baseline font-bold">
              <span className="text-base text-[#132E20]">Total Amount (Pay on Delivery)</span>
              <span className="font-serif text-xl text-[#EA580C]">
                ₹{Number(placedOrder.total).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/orders"
              className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#132E20] hover:bg-[#EA580C] text-white font-bold text-sm shadow-md transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>Track in My Orders</span>
            </Link>
            <Link
              to="/menu"
              className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white border border-[#E8E2D8] hover:border-[#132E20] text-[#132E20] font-semibold text-sm transition-colors"
            >
              <span>Back to Menu</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">
            Final Step
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#132E20] mt-1">
            Delivery & Payment
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#132E20] mb-6 pb-4 border-b border-[#F0EAE1]">
              Delivery Details
            </h2>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                  Customer Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-colors"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Our delivery valet will call this number upon arrival.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                  Delivery Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                  <textarea
                    rows={3}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Flat/House no., building name, street, nearest landmark..."
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Payment Method Option */}
              <div className="pt-4 border-t border-[#F0EAE1]">
                <label className="block text-xs font-bold text-[#132E20] mb-3 uppercase tracking-wider">
                  Payment Method
                </label>

                <div className="p-4 rounded-2xl bg-[#FAF8F5] border-2 border-[#EA580C] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#132E20]">Cash on Delivery (COD)</p>
                      <p className="text-xs text-gray-500">Pay cash or UPI directly to delivery valet</p>
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full border-2 border-[#EA580C] flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]" />
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-[#EA580C] hover:bg-[#D04F1C] text-white font-bold text-base shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <span>Placing order in kitchen...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order (₹{grandTotal.toFixed(2)})</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Items Summary */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm space-y-6">
            <h2 className="font-serif text-2xl font-bold text-[#132E20] pb-4 border-b border-[#F0EAE1]">
              Order Summary
            </h2>

            <div className="divide-y divide-[#F0EAE1] max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-[#FAF8F5] text-xs font-bold text-[#132E20] flex items-center justify-center border border-[#E8E2D8] shrink-0">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-[#132E20] truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-[#132E20] shrink-0">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#F0EAE1] space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-[#132E20]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5% GST)</span>
                <span className="font-medium text-[#132E20]">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium text-[#132E20]">₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-[#F0EAE1] flex justify-between items-baseline font-bold">
                <span className="text-base text-[#132E20]">Total Amount</span>
                <span className="font-serif text-2xl text-[#EA580C]">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs text-gray-500 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Orders are processed through server-side verified prices. No card details required for Cash on Delivery.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
