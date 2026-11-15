import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  UtensilsCrossed,
  ReceiptText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      setUserDropdownOpen(false);
      setMobileMenuOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold tracking-wide transition-colors ${
      isActive
        ? 'text-[#EA580C] border-b-2 border-[#EA580C] pb-1'
        : 'text-[#132E20] hover:text-[#EA580C]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D8] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#132E20] group-hover:bg-[#EA580C] flex items-center justify-center text-white transition-colors duration-300 shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-black tracking-tight text-[#132E20] leading-none">
                FOOD<span className="text-[#EA580C]">HUB</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#132E20]/60 mt-0.5">
                Artisanal Kitchen
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/menu" className={navLinkClass}>
              Explore Menu
            </NavLink>
            {user && (
              <NavLink to="/orders" className={navLinkClass}>
                My Orders
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#132E20] text-white shadow-xs'
                      : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  }`
                }
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </NavLink>
            )}
          </nav>

          {/* Right Actions: Cart & User */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-white border border-[#E8E2D8] text-[#132E20] hover:text-[#EA580C] hover:border-[#EA580C]/40 transition-all shadow-xs"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#EA580C] text-white text-[11px] font-bold flex items-center justify-center shadow-sm animate-scale-in">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white border border-[#E8E2D8] hover:border-[#132E20] transition-colors shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#132E20] text-white font-bold text-xs flex items-center justify-center">
                    {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-semibold text-[#132E20] max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E8E2D8] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2.5 border-b border-[#F0EAE1]">
                        <p className="text-xs text-gray-500 font-medium">Signed in as</p>
                        <p className="text-sm font-bold text-[#132E20] truncate">
                          {profile?.full_name || 'Customer'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-md">
                            Administrator
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#132E20] hover:bg-[#F7F3EB] transition-colors"
                        >
                          <ReceiptText className="w-4 h-4 text-gray-500" />
                          My Orders
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-800 font-medium hover:bg-emerald-50 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-[#F0EAE1] pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#132E20] hover:bg-[#EA580C] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#132E20] hover:bg-[#F5F0E8] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E8E2D8] px-4 pt-2 pb-6 space-y-3">
          <NavLink
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-[#132E20] hover:bg-[#F0EAE1]"
          >
            Home
          </NavLink>
          <NavLink
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-semibold text-[#132E20] hover:bg-[#F0EAE1]"
          >
            Explore Menu
          </NavLink>
          {user && (
            <NavLink
              to="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-[#132E20] hover:bg-[#F0EAE1]"
            >
              My Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-emerald-800 bg-emerald-50"
            >
              Admin Dashboard
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
