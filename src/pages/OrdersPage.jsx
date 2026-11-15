import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Package,
  ReceiptText,
  MapPin,
  RefreshCw,
  Phone,
  AlertCircle,
  CheckCircle,
  Truck,
  ChefHat,
  XCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return {
        label: 'Order Confirmed',
        bg: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      };
    case 'preparing':
      return {
        label: 'Kitchen Preparing',
        bg: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <ChefHat className="w-3.5 h-3.5" />,
      };
    case 'out_for_delivery':
      return {
        label: 'Out for Delivery',
        bg: 'bg-orange-100 text-[#EA580C] border-orange-200',
        icon: <Truck className="w-3.5 h-3.5" />,
      };
    case 'delivered':
      return {
        label: 'Delivered',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-100 text-rose-800 border-rose-200',
        icon: <XCircle className="w-3.5 h-3.5" />,
      };
    case 'pending':
    default:
      return {
        label: 'Pending Confirmation',
        bg: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <Clock className="w-3.5 h-3.5" />,
      };
  }
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      setError(err.message || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">
              Your Culinary Journey
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#132E20] mt-1">
              My Orders
            </h1>
          </div>
          <button
            onClick={fetchOrders}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E8E2D8] hover:border-[#132E20] text-xs font-semibold text-[#132E20] transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Status</span>
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving your orders from database..." />
        ) : error ? (
          <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center shadow-xs">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-gray-900 mb-1">
              Could not retrieve orders
            </h3>
            <p className="text-xs text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-[#132E20] text-white text-xs font-bold rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D8] shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F0E8] text-[#132E20] mx-auto flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-[#EA580C]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#132E20] mb-2">
              No orders placed yet
            </h2>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              When you order hot, fresh meals from FOODHUB, you'll be able to track live updates and review item receipts right here.
            </p>
            <Link
              to="/menu"
              className="inline-block px-6 py-3 rounded-2xl bg-[#EA580C] hover:bg-[#D04F1C] text-white font-bold text-sm shadow-md"
            >
              Explore Our Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const badge = getStatusBadge(order.status);
              const formattedDate = new Date(order.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm space-y-6"
                >
                  {/* Top Header: ID, Date, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#132E20]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Placed on {formattedDate}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-gray-400 block">Total Amount</span>
                      <span className="font-serif text-2xl font-black text-[#EA580C]">
                        ₹{Number(order.total).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E2D8]">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#132E20] block mb-0.5">
                          Delivery Address:
                        </span>
                        <span>{order.delivery_address}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-[#132E20] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#132E20] block mb-0.5">
                          Recipient & Contact:
                        </span>
                        <span>{order.customer_name} ({order.phone})</span>
                        <span className="block text-[11px] text-gray-400 mt-0.5 capitalize">
                          Payment: {order.payment_method?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ordered Items Table */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                      <ReceiptText className="w-3.5 h-3.5 text-[#EA580C]" />
                      Items in this Order
                    </h4>
                    <div className="divide-y divide-[#F0EAE1]">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-md bg-[#FAF8F5] text-xs font-bold text-[#132E20] flex items-center justify-center border border-[#E8E2D8]">
                              {item.quantity}x
                            </span>
                            <span className="font-medium text-[#132E20]">
                              {item.item_name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-[#132E20]">
                              ₹{Number(item.line_total).toFixed(2)}
                            </span>
                            <span className="text-[11px] text-gray-400 block">
                              ₹{Number(item.unit_price).toFixed(2)} each
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div className="pt-3 border-t border-[#F0EAE1] flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
                    <div>
                      Subtotal: ₹{Number(order.subtotal).toFixed(2)} | Tax (5%): ₹{Number(order.tax).toFixed(2)} | Delivery: ₹{Number(order.delivery_fee).toFixed(2)}
                    </div>
                    <span className="font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      ✓ Authenticated Kitchen Order
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
