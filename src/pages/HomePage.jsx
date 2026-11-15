import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  Award,
  ShieldCheck,
  Star,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import FoodCard from '../components/FoodCard';
import LoadingSpinner from '../components/LoadingSpinner';

export const HomePage = () => {
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('is_available', true)
          .limit(3);

        if (error) throw error;
        setFeaturedDishes(data || []);
      } catch (err) {
        console.error('Failed to load featured dishes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F5F0E8] via-[#FAF8F5] to-[#FAF8F5] py-16 sm:py-24 lg:py-28 border-b border-[#E8E2D8]">
        {/* Decorative background radial glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#EA580C]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#132E20]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#132E20]/5 border border-[#132E20]/10 text-xs font-bold uppercase tracking-widest text-[#132E20]">
                <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>The Authentic Gastronomy Experience</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#132E20] leading-[1.08]">
                Good food. <br />
                <span className="italic font-normal text-[#EA580C]">Good mood.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Indulge in royal Awadhi biryanis, slow-simmered rich curries, and sizzling tandoori breads — freshly handcrafted by seasoned master chefs and delivered steaming hot to your doorstep.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#EA580C] hover:bg-[#D04F1C] text-white font-bold text-base shadow-lg hover:shadow-xl hover:shadow-[#EA580C]/25 transition-all duration-200 active:scale-95"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-white border border-[#E8E2D8] hover:border-[#132E20] text-[#132E20] font-semibold text-base transition-colors shadow-xs"
                >
                  <span>Our Heritage</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-8 border-t border-[#E8E2D8]/80 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>100% Quality Guaranteed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#EA580C] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Quick 30 Min Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <span>4.9 / 5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Food Presentation */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                {/* Decorative border frame */}
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-[#EA580C]/20 to-[#132E20]/20 transform rotate-2 blur-xs pointer-events-none" />

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/3 lg:aspect-square bg-[#F5F0E8]">
                  <img
                    src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85"
                    alt="Signature Dum Biryani"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />

                  {/* Floating floating dish tag */}
                  <div className="absolute top-4 left-4 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-[#E8E2D8]/80 max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
                      <span className="text-xs font-bold text-[#132E20] uppercase tracking-wide">
                        Trending Now
                      </span>
                    </div>
                    <p className="font-serif font-bold text-sm text-[#132E20] mt-1">
                      Chicken Biryani
                    </p>
                    <p className="text-xs text-[#EA580C] font-extrabold">₹320.00</p>
                  </div>

                  {/* Floating Chef's seal */}
                  <div className="absolute bottom-4 right-4 p-3 bg-[#132E20]/95 backdrop-blur-md rounded-2xl text-white shadow-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EA580C] flex items-center justify-center text-white">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div className="text-left pr-2">
                      <p className="text-[10px] uppercase font-bold text-gray-300 tracking-wider">
                        Clay Tandoor
                      </p>
                      <p className="text-xs font-bold">Dum-Pukht Cooking</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes Section */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">
                Handpicked Favorites
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132E20] mt-1">
                Chef's Signature Selections
              </h2>
            </div>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#132E20] hover:text-[#EA580C] transition-colors group"
            >
              <span>View All Dishes</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Fetching freshly cooked specials from the kitchen..." />
          ) : featuredDishes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDishes.map((dish) => (
                <FoodCard key={dish.id} item={dish} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white border border-[#E8E2D8] rounded-2xl text-center">
              <p className="text-gray-600">No featured dishes found right now.</p>
              <Link to="/menu" className="mt-4 inline-block text-sm font-bold text-[#EA580C]">
                Browse Menu
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Heritage Section */}
      <section id="about" className="py-20 bg-white border-y border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Grid */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden h-48 sm:h-56 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
                    alt="Paneer Butter Masala"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D8]">
                  <p className="font-serif text-3xl font-black text-[#132E20]">100%</p>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mt-1">
                    Pure Desi Ghee & Spices
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="p-6 bg-[#132E20] text-white rounded-2xl shadow-md">
                  <p className="font-serif text-3xl font-black text-[#EA580C]">25+</p>
                  <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider mt-1">
                    Years of Culinary Legacy
                  </p>
                </div>
                <div className="rounded-2xl overflow-hidden h-48 sm:h-56 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80"
                    alt="Masala Dosa"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>

            {/* About Story */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">
                Our Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#132E20] leading-tight">
                Crafted with Passion. Served with Heart.
              </h2>
              <p className="text-gray-600 leading-relaxed">
                At FOODHUB, dining is a celebration. We believe that good food creates memorable conversations and elevates everyday moments into cherished rituals.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every recipe in our kitchen honors culinary roots — from grinding our custom garam masalas in small batches each morning, to slow-roasting gravies until they achieve rich, velvety depth without shortcuts or artificial colors.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#EA580C] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#132E20]">Master Recipes</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Heritage secret spice blends refined over decades.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#132E20]">Live Clay Tandoor</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Charcoal fire roasted naans and smoking kebabs.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-[#132E20] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="inline-block px-3 py-1 rounded-full bg-[#EA580C] text-xs font-bold uppercase tracking-wider">
            Ready to Feast?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Order Your Favorite Dishes in Seconds
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base">
            Browse our full live menu, customize your order, and enjoy contactless delivery directly from our kitchen to your table.
          </p>
          <div className="pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#EA580C] hover:bg-[#D04F1C] text-white font-bold text-base shadow-xl transition-transform active:scale-95"
            >
              <span>View Full Menu & Order</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
