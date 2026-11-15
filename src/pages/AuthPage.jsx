import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  UtensilsCrossed,
  AlertCircle,
  CheckCircle2,
  Send,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, resendConfirmationEmail } = useAuth();

  const paramMode = searchParams.get('mode');
  const initialMode = paramMode === 'signup' ? 'signup' : paramMode === 'resend' ? 'resend' : 'login';
  const returnTo = searchParams.get('returnTo') || '/';

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup' | 'resend'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState(null);
  const [registrationPending, setRegistrationPending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, returnTo]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUnconfirmedEmail(null);
    setResendSuccess(null);

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const data = await signUp({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
        });

        // If auto-confirmed (or email confirmation disabled in project)
        if (data?.session) {
          navigate(returnTo, { replace: true });
        } else {
          // Email confirmation is required
          setRegistrationPending(true);
          setResendCooldown(60);
        }
      } catch (err) {
        console.error('Registration failed:', err);
        setError(err.message || 'Registration failed. Please check your details.');
      } finally {
        setLoading(false);
      }
    } else if (mode === 'login') {
      // Login
      setLoading(true);
      try {
        await signIn({
          email: email.trim(),
          password,
        });
        navigate(returnTo, { replace: true });
      } catch (err) {
        console.error('Login failed:', err);
        const errMsg = err.message || '';
        if (
          errMsg.toLowerCase().includes('email not confirmed') ||
          err.code === 'email_not_confirmed'
        ) {
          setUnconfirmedEmail(email.trim());
          setError(
            'Your email address has not been confirmed yet. Please verify your email before signing in.'
          );
        } else {
          setError(err.message || 'Invalid email or password.');
        }
      } finally {
        setLoading(false);
      }
    } else if (mode === 'resend') {
      // Direct resend request
      handleResend(email);
    }
  };

  const handleResend = async (targetEmail) => {
    const toSend = targetEmail || email;
    if (!toSend || !toSend.trim()) {
      setError('Please enter your email address to resend confirmation.');
      return;
    }

    setResendLoading(true);
    setError(null);
    setResendSuccess(null);

    try {
      await resendConfirmationEmail(toSend.trim());
      setResendSuccess(
        `Confirmation email dispatched to ${toSend.trim()}! Please check your inbox and spam folder.`
      );
      setResendCooldown(60);
    } catch (err) {
      console.error('Failed to resend confirmation email:', err);
      setError(err.message || 'Failed to resend email. Please try again shortly.');
    } finally {
      setResendLoading(false);
    }
  };

  // Screen for Registration Confirmation Pending
  if (registrationPending) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#E8E2D8] shadow-md text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-orange-100 text-[#EA580C] mx-auto flex items-center justify-center">
            <Mail className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#EA580C]">
              Step 2 of 2
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#132E20] mt-1">
              Verify Your Email
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              We have dispatched a secure confirmation link to:
            </p>
            <p className="font-bold text-sm text-[#132E20] bg-[#FAF8F5] py-2 px-4 rounded-xl mt-2 inline-block border border-[#E8E2D8]">
              {email}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F4EE] border border-[#E5DFD5] text-left text-xs text-gray-600 space-y-1.5">
            <p className="font-bold text-[#132E20]">What's next?</p>
            <p>1. Open your inbox (and check Spam/Junk folder if not visible).</p>
            <p>2. Click <strong>Confirm your mail</strong> in the message from FOODHUB.</p>
            <p>3. You will be redirected back here confirmed and signed in!</p>
          </div>

          {resendSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resendSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 space-y-3">
            <button
              onClick={() => handleResend(email)}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F0EAE1] border border-[#E5DFD5] text-[#132E20] font-semibold text-xs transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {resendLoading
                  ? 'Sending confirmation...'
                  : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : 'Resend Confirmation Email'}
              </span>
            </button>

            <button
              onClick={() => {
                setRegistrationPending(false);
                setMode('login');
              }}
              className="text-xs font-bold text-[#EA580C] hover:underline"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-[#132E20] group-hover:bg-[#EA580C] text-white flex items-center justify-center transition-colors shadow-md">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#132E20]">
          {mode === 'login'
            ? 'Welcome Back'
            : mode === 'signup'
            ? 'Join FOODHUB'
            : 'Resend Email Verification'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'login'
            ? 'Sign in to access your orders, cart, and profile'
            : mode === 'signup'
            ? 'Create your customer account to start ordering'
            : 'Enter your email to receive a fresh confirmation link'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E8E2D8] shadow-sm">
          {/* Tabs */}
          <div className="flex rounded-2xl bg-[#F7F4EE] p-1.5 mb-6 border border-[#E5DFD5]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setUnconfirmedEmail(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#132E20] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
                setUnconfirmedEmail(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#132E20] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('resend');
                setError(null);
                setUnconfirmedEmail(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'resend'
                  ? 'bg-white text-[#132E20] shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Resend Link
            </button>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>

              {/* Instant Resend Button if email is not confirmed */}
              {unconfirmedEmail && (
                <div className="pt-2 border-t border-rose-200/80">
                  <button
                    type="button"
                    onClick={() => handleResend(unconfirmedEmail)}
                    disabled={resendLoading || resendCooldown > 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>
                      {resendLoading
                        ? 'Sending...'
                        : resendCooldown > 0
                        ? `Wait ${resendCooldown}s`
                        : `Resend Confirmation to ${unconfirmedEmail}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{resendSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {mode !== 'resend' && (
              <div>
                <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-[#132E20] mb-1.5 uppercase tracking-wider">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] text-sm text-[#132E20] placeholder-gray-400 focus:outline-none focus:border-[#EA580C] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || resendLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#132E20] hover:bg-[#EA580C] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading || resendLoading ? (
                  <span>Processing...</span>
                ) : mode === 'login' ? (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <span>Create Account & Verify</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Send Confirmation Email</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {mode === 'login' && (
            <div className="mt-4 pt-4 border-t border-[#F0EAE1] text-center">
              <button
                onClick={() => {
                  setMode('resend');
                  setError(null);
                }}
                className="text-xs text-gray-500 hover:text-[#EA580C] font-semibold transition-colors"
              >
                Didn't receive your confirmation email? Click here
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          FOODHUB uses secure email confirmation to protect customer accounts.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
