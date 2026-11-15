import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import VegBadge from '../components/VegBadge';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(null);

  // Menu Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    price: '',
    description: '',
    image_url: '',
    is_vegetarian: true,
    is_available: true,
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      // 1. Fetch all orders with items
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;

      // 2. Fetch all menu items
      const { data: menuData, error: menuErr } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });

      if (menuErr) throw menuErr;

      setOrders(ordersData || []);
      setMenuItems(menuData || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating(orderId);
    try {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setStatusUpdating(null);
    }
  };

  // Toggle item availability
  const handleToggleAvailability = async (item) => {
    try {
      const { error: toggleErr } = await supabase
        .from('menu_items')
        .update({ is_available: !item.is_available })
        .eq('id', item.id);

      if (toggleErr) throw toggleErr;

      setMenuItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_available: !m.is_available } : m))
      );
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      alert('Error: ' + err.message);
    }
  };

  // Delete menu item
  const handleDeleteMenuItem = async (id, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      return;
    }

    try {
      const { error: delErr } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (delErr) throw delErr;

      setMenuItems((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Error: ' + err.message);
    }
  };

  // Open modal for Create or Edit
  const openModal = (item = null) => {
    setEditingItem(item);
    setModalError(null);
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'Main Course',
        price: item.price || '',
        description: item.description || '',
        image_url: item.image_url || '',
        is_vegetarian: item.is_vegetarian ?? true,
        is_available: item.is_available ?? true,
      });
    } else {
      setFormData({
        name: '',
        category: 'Main Course',
        price: '',
        description: '',
        image_url: '',
        is_vegetarian: true,
        is_available: true,
      });
    }
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.name.trim()) {
      setModalError('Dish name is required.');
      return;
    }
    if (Number(formData.price) <= 0) {
      setModalError('Please enter a valid price greater than zero.');
      return;
    }

    setModalLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
        image_url: formData.image_url.trim() || null,
        is_vegetarian: formData.is_vegetarian,
        is_available: formData.is_available,
      };

      if (editingItem) {
        // Update existing item
        const { data, error: updateErr } = await supabase
          .from('menu_items')
          .update(payload)
          .eq('id', editingItem.id)
          .select()
          .single();

        if (updateErr) throw updateErr;

        setMenuItems((prev) =>
          prev.map((m) => (m.id === editingItem.id ? data : m))
        );
      } else {
        // Insert new item
        const { data, error: insertErr } = await supabase
          .from('menu_items')
          .insert(payload)
          .select()
          .single();

        if (insertErr) throw insertErr;

        setMenuItems((prev) => [...prev, data]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save menu item:', err);
      setModalError(err.message || 'Could not save menu item.');
    } finally {
      setModalLoading(false);
    }
  };

  // Summary Metrics
  const totalOrdersCount = orders.length;
  const totalRevenue = orders.reduce((sum, ord) => sum + Number(ord.total || 0), 0);
  const pendingOrdersCount = orders.filter((ord) => ord.status === 'pending').length;
  const totalMenuItemsCount = menuItems.length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Staff & Kitchen Portal
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#132E20] mt-1">
              FOODHUB Control Dashboard
            </h1>
          </div>
          <button
            onClick={fetchData}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E8E2D8] text-xs font-bold text-[#132E20] hover:border-[#132E20] transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh All Live Data</span>
          </button>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D8] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-black text-[#132E20]">
              ₹{totalRevenue.toFixed(2)}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">From all completed & live orders</p>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D8] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-black text-[#132E20]">
              {totalOrdersCount}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Lifetime customer orders</p>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D8] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-black text-[#EA580C]">
              {pendingOrdersCount}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Awaiting kitchen confirmation</p>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D8] shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Menu Catalog</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-black text-[#132E20]">
              {totalMenuItemsCount}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">Dishes in database</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mb-6 border-b border-[#E8E2D8] pb-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#132E20] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 bg-white border border-[#E8E2D8]'
            }`}
          >
            Order Management ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-[#132E20] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 bg-white border border-[#E8E2D8]'
            }`}
          >
            Menu Items Management ({menuItems.length})
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Synchronizing administrator data..." />
        ) : error ? (
          <div className="p-8 bg-white border border-rose-200 rounded-3xl text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-sm text-gray-700">{error}</p>
          </div>
        ) : activeTab === 'orders' ? (
          /* Orders Tab */
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl text-center border border-[#E8E2D8]">
                <p className="text-gray-500 text-sm">No orders recorded in the system yet.</p>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-xs hover:border-[#EA580C]/40 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-[#132E20]">
                          #{ord.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(ord.created_at).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#132E20] mt-1">
                        {ord.customer_name} · <span className="font-sans font-normal text-sm text-gray-500">{ord.phone}</span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{ord.delivery_address}</p>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">Order Total</span>
                        <span className="font-serif text-xl font-bold text-[#EA580C]">
                          ₹{Number(ord.total).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={ord.status}
                          disabled={statusUpdating === ord.id}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF8F5] border border-[#E5DFD5] text-[#132E20] focus:outline-none focus:border-[#EA580C] cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Mini Summary */}
                  <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-gray-400 uppercase tracking-wider">Items:</span>
                    {ord.order_items?.map((it) => (
                      <span
                        key={it.id}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8] text-[#132E20] font-medium"
                      >
                        {it.quantity}x {it.item_name} (₹{Number(it.line_total).toFixed(2)})
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Menu Items Tab */
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-xs text-gray-500">
                Manage dishes, pricing, descriptions, and kitchen availability.
              </p>
              <button
                onClick={() => openModal(null)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#EA580C] hover:bg-[#D04F1C] text-white text-xs font-bold shadow-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Food Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-44 bg-[#F5F0E8]">
                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <div className="p-1 bg-white rounded-md shadow-xs">
                        <VegBadge isVegetarian={item.is_vegetarian} size="sm" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#132E20]/90 text-white">
                        {item.category}
                      </span>
                    </div>

                    {/* Quick Availability Toggle */}
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs transition-colors ${
                        item.is_available
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-rose-600 text-white hover:bg-rose-700'
                      }`}
                    >
                      {item.is_available ? 'In Stock' : 'Sold Out'}
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h4 className="font-serif text-lg font-bold text-[#132E20] leading-snug">
                          {item.name}
                        </h4>
                        <span className="text-base font-bold text-[#EA580C]">
                          ₹{Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                        {item.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#132E20] text-xs font-semibold text-[#132E20] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMenuItem(item.id, item.name)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal for Add / Edit Food Item */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E2D8] max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1] mb-5">
                <h3 className="font-serif text-2xl font-bold text-[#132E20]">
                  {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleModalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Garlic Naan"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] focus:outline-none focus:border-[#EA580C]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Main Course, Biryani"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="280.00"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] focus:outline-none focus:border-[#EA580C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Key spices, ingredients, and texture..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] focus:outline-none focus:border-[#EA580C] resize-none"
                  />
                </div>

                {/* Checkbox toggles */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#132E20]">
                    <input
                      type="checkbox"
                      checked={formData.is_vegetarian}
                      onChange={(e) =>
                        setFormData({ ...formData, is_vegetarian: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Vegetarian Dish</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#132E20]">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) =>
                        setFormData({ ...formData, is_available: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#EA580C] focus:ring-[#EA580C]"
                    />
                    <span>Available in Kitchen</span>
                  </label>
                </div>

                <div className="pt-5 border-t border-[#F0EAE1] flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#D04F1C] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {modalLoading ? 'Saving Dish...' : editingItem ? 'Save Changes' : 'Create Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
