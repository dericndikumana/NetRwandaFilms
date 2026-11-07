'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Film, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError('Invalid administrator email or password. Please try again.');
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('An unexpected network error occurred. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-brand-bg transition-colors duration-200">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-brand-amber/20 border border-brand-amber/40 flex items-center justify-center text-brand-amber shadow-amber">
            <Film className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-brand-text">
            NetRwanda<span className="text-brand-amber">Films</span>
          </span>
        </Link>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-green font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Authorized Staff & Editorial Access</span>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full sm:max-w-md bg-brand-surface border border-brand-border rounded-3xl p-8 sm:p-10 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brand-text">Admin Sign In</h2>
          <p className="text-sm text-brand-text-muted mt-1">
            Access film uploads, licensing rights, categories, and analytics.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-brand-coral/15 border border-brand-coral/30 flex items-start gap-3 text-brand-coral text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-2">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@netrwanda.com"
              className="w-full px-4 py-3 rounded-2xl bg-brand-bg/70 border border-brand-border text-brand-text placeholder-brand-text-muted/60 focus:outline-none focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/30 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-muted mb-2">
              Secret Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-brand-bg/70 border border-brand-border text-brand-text placeholder-brand-text-muted/60 focus:outline-none focus:border-brand-amber focus:ring-2 focus:ring-brand-amber/30 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-[0.98] text-[#1B1F3B] font-semibold text-sm shadow-amber flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-brand-border/60 text-center">
          <Link
            href="/"
            className="text-xs text-brand-text-muted hover:text-brand-amber transition-colors"
          >
            &larr; Return to NetRwandaFilms Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

