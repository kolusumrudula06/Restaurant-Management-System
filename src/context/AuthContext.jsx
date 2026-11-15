import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { parseAuthRedirect, cleanAuthUrl } from '../lib/authRedirect';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Fetch customer profile from Supabase profiles table
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error fetching profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1. Check for email verification redirect tokens or errors in the current URL
    const redirectData = parseAuthRedirect();

    const handleInitialAuth = async () => {
      try {
        if (redirectData) {
          if (redirectData.type === 'error') {
            setVerificationStatus({
              type: 'error',
              message: redirectData.message,
              code: redirectData.code,
            });
            cleanAuthUrl();
          } else if (redirectData.type === 'success') {
            setVerificationStatus({
              type: 'success',
              message: redirectData.message,
            });
            cleanAuthUrl();
          } else if (redirectData.type === 'code') {
            // Exchange PKCE authorization code for session
            const { data, error: exchangeErr } =
              await supabase.auth.exchangeCodeForSession(redirectData.code);
            cleanAuthUrl();
            if (exchangeErr) {
              setVerificationStatus({
                type: 'error',
                message: exchangeErr.message || 'Verification code exchange failed.',
              });
            } else if (data?.user) {
              setVerificationStatus({
                type: 'success',
                message:
                  'Email successfully verified! Your FOODHUB customer account is now confirmed.',
              });
              setUser(data.user);
              await fetchProfile(data.user.id);
            }
          }
        }

        // Fetch existing session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (!redirectData || redirectData.type !== 'code') {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error during initial auth setup:', err);
      } finally {
        setLoading(false);
      }
    };

    handleInitialAuth();

    // 2. Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);

          // If the event is SIGNED_IN right after an email confirmation
          if (event === 'SIGNED_IN' && redirectData?.type === 'success') {
            setVerificationStatus({
              type: 'success',
              message: 'Email successfully verified! Welcome to FOODHUB.',
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email, password, full name, and explicit emailRedirectTo
  const signUp = async ({ email, password, fullName }) => {
    const redirectTo = window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;
    return data;
  };

  // Sign in with email and password
  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return data;
  };

  // Resend confirmation email using supabase.auth.resend()
  const resendConfirmationEmail = async (email) => {
    if (!email || !email.trim()) {
      throw new Error('Please enter a valid email address.');
    }

    const redirectTo = window.location.origin;

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    isAdmin,
    loading,
    verificationStatus,
    clearVerificationStatus: () => setVerificationStatus(null),
    signUp,
    signIn,
    signOut,
    resendConfirmationEmail,
    refreshProfile: () => user && fetchProfile(user.id),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
