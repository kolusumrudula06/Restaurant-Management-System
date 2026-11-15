import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#132E20] text-[#F5F0E8] pt-16 pb-10 border-t border-[#1B3F2D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#1B3F2D]/80">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#EA580C] flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-black tracking-tight text-white">
                FOOD<span className="text-[#EA580C]">HUB</span>
              </span>
            </div>
            <p className="font-serif italic text-lg text-emerald-200/90">
              Good food. Good mood.
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Crafting authentic, unforgettable dining experiences with slow-cooked gravies, royal biryanis, and farm-fresh ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-white tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-[#EA580C] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-[#EA580C] transition-colors">
                  Explore Full Menu
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#EA580C] transition-colors">
                  My Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#EA580C] transition-colors">
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours & Service */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-white tracking-wide">
              Operating Hours
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Monday - Sunday</p>
                  <p className="text-xs text-gray-400">11:00 AM – 11:00 PM</p>
                </div>
              </div>
              <p className="text-xs text-emerald-300/80 pt-2">
                ✓ Express Delivery & Dine-in Takeaway available
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-white tracking-wide">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#EA580C] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#EA580C] shrink-0" />
                <span>orders@foodhub.kitchen</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                <span>42 Gourmet Boulevard, Food District, Bangalore 560001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2026 FOODHUB Kitchens. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-gray-400">
            Cooked with <Heart className="w-3.5 h-3.5 text-[#EA580C] fill-[#EA580C]" /> for food lovers everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
