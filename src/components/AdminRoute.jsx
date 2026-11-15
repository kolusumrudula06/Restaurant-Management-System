import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export const AdminRoute = ({ children }) => {
  const { user, profile, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Verifying administrator credentials..." />;
  }

  if (!user) {
    return <Navigate to="/auth?mode=login&returnTo=/admin" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-3xl text-center shadow-lg">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">
          Administrator Access Required
        </h2>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          You are currently signed in as <strong>{profile?.full_name || user.email}</strong> with role{' '}
          <span className="font-semibold text-rose-600 uppercase">'{profile?.role || 'customer'}'</span>.
          This portal is restricted to FOODHUB management accounts.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#132E20] text-white hover:bg-[#EA580C] font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Customer Homepage
        </Link>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
