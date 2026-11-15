import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import FoodCard from '../components/FoodCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegFilter, setVegFilter] = useState('all'); // 'all' | 'veg' | 'non-veg'

  const fetchMenuItems = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('menu_items')
        .select('*')
        .order('name', { ascending: true });

      if (fetchErr) throw fetchErr;
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError(err.message || 'Failed to load menu items from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems(false);
  }, []);

  // Compute unique categories from database items
  const categories = useMemo(() => {
    const set = new Set(menuItems.map((item) => item.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // 1. Search Query
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Category
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      // 3. Veg / Non-Veg
      const matchesVeg =
        vegFilter === 'all' ||
        (vegFilter === 'veg' && item.is_vegetarian) ||
        (vegFilter === 'non-veg' && !item.is_vegetarian);

      return matchesSearch && matchesCategory && matchesVeg;
    });
  }, [menuItems, searchQuery, selectedCategory, vegFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setVegFilter('all');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">
            Prepared Fresh Daily
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#132E20] mt-1 mb-3">
            Our Culinary Repertoire
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Every dish is cooked on order using royal spices and time-honored techniques.
            Select your favorites and add them to your cart.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-[#E8E2D8] mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by dish name or ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#F7F4EE] border border-[#E5DFD5] text-sm text-[#132E20] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Veg / Non-Veg Toggle Filter */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F7F4EE] rounded-2xl border border-[#E5DFD5] shrink-0 self-start md:self-auto">
              <button
                onClick={() => setVegFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  vegFilter === 'all'
                    ? 'bg-[#132E20] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Dishes
              </button>
              <button
                onClick={() => setVegFilter('veg')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  vegFilter === 'veg'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Veg Only
              </button>
              <button
                onClick={() => setVegFilter('non-veg')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  vegFilter === 'non-veg'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-rose-800 hover:bg-rose-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                Non-Veg
              </button>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="pt-2 border-t border-[#F0EAE1] flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#EA580C] text-white shadow-xs scale-[1.02]'
                    : 'bg-[#FAF8F5] text-[#132E20] border border-[#E8E2D8] hover:border-[#132E20]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingSpinner text="Retrieving live menu items from Supabase..." />
        ) : error ? (
          <div className="max-w-md mx-auto my-12 p-8 bg-white border border-rose-200 rounded-3xl text-center shadow-md">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-gray-900 mb-1">
              Unable to Load Menu
            </h3>
            <p className="text-xs text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchMenuItems}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#132E20] text-white font-semibold text-xs hover:bg-[#EA580C] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Connection
            </button>
          </div>
        ) : filteredItems.length > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-6 px-1">
              <span>Showing <strong>{filteredItems.length}</strong> delicious items</span>
              {(searchQuery || selectedCategory !== 'All' || vegFilter !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="text-[#EA580C] hover:underline font-bold"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto my-12 p-10 bg-white border border-[#E8E2D8] rounded-3xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F5F0E8] flex items-center justify-center text-2xl">
              🔍
            </div>
            <h3 className="font-serif text-xl font-bold text-[#132E20] mb-2">
              No matching dishes found
            </h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              We couldn't find anything matching your current filters. Try searching for something else or reset your filter preferences.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-xl bg-[#EA580C] text-white text-xs font-bold hover:bg-[#D04F1C] transition-colors shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
