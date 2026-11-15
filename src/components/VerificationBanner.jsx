import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const VerificationBanner = () => {
  const { verificationStatus, clearVerificationStatus } = useAuth();

  useEffect(() => {
    if (verificationStatus?.type === 'success') {
      const timer = setTimeout(() => {
        clearVerificationStatus();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus, clearVerificationStatus]);

  if (!verificationStatus) return null;

  const isSuccess = verificationStatus.type === 'success';

  return (
    <div
      className={`relative z-40 border-b px-4 py-3 sm:px-6 shadow-sm transition-all duration-300 ${
        isSuccess
          ? 'bg-emerald-600 text-white border-emerald-700'
          : 'bg-[#EA580C] text-white border-orange-700'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isSuccess ? (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="text-xs sm:text-sm font-medium leading-snug">
            <span className="font-bold">
              {isSuccess ? 'Account Confirmed: ' : 'Verification Notice: '}
            </span>
            <span>{verificationStatus.message}</span>
            {!isSuccess && (
              <span className="block sm:inline sm:ml-2 mt-0.5 sm:mt-0 opacity-90 text-[11px] sm:text-xs">
                Need a new link?{' '}
                <Link
                  to="/auth?mode=resend"
                  onClick={clearVerificationStatus}
                  className="underline font-bold hover:text-white"
                >
                  Resend Confirmation Email
                </Link>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={clearVerificationStatus}
          className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default VerificationBanner;
