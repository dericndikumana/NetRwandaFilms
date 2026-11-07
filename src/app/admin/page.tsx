'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Eye,
  HardDrive,
  Activity,
  AlertCircle,
  Clock,
  PlusCircle,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';

interface AdminStats {
  totalMovies: number;
  activeLicensedMovies: number;
  expiredMovies: number;
  expiringSoonMovies: number;
  totalViews: number;
  estimatedStorageBytes: string;
  estimatedBandwidthBytes: string;
  popularMovies: Array<{
    id: string;
    title: string;
    titleRw?: string | null;
    slug: string;
    posterUrl: string;
    viewsCount: number;
    licenseStatus: string;
    releaseYear: number;
    hasKinyarwanda: boolean;
  }>;
  pendingReportsCount: number;
  usersCount: number;
  commentsCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-brand-text-muted">
        <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
        <p className="text-sm">Loading NetRwandaFilms metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
            Platform Overview
          </h2>
          <p className="text-sm text-brand-text-muted mt-1">
            Real-time analytics, legal licensing compliance, and media infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/movies?action=new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-semibold text-sm shadow-amber transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Film</span>
          </Link>
          <Link
            href="/admin/banners"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-surface hover:bg-brand-surface-hover text-brand-text border border-brand-border text-sm font-medium transition-all"
          >
            <Sparkles className="w-4 h-4 text-brand-amber" />
            <span>Curate Banners</span>
          </Link>
        </div>
      </div>

      {/* License Legal Expiration Alert Banners */}
      {stats && stats.expiredMovies > 0 && (
        <div className="p-5 rounded-3xl bg-brand-coral/15 border border-brand-coral/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-coral/20 flex items-center justify-center text-brand-coral flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-coral">
                Legal Notice: {stats.expiredMovies} Movie License(s) Expired
              </h3>
              <p className="text-xs text-brand-text-muted mt-0.5">
                These titles are automatically hidden from the public streaming catalog in accordance with Rwandan copyright law.
              </p>
            </div>
          </div>
          <Link
            href="/admin/licenses"
            className="px-4 py-2 rounded-xl bg-brand-coral hover:bg-brand-coral/90 text-[#1B1F3B] text-xs font-bold transition-all whitespace-nowrap"
          >
            Review Licenses &rarr;
          </Link>
        </div>
      )}

      {stats && stats.expiringSoonMovies > 0 && (
        <div className="p-4 rounded-3xl bg-brand-amber/15 border border-brand-amber/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-amber flex-shrink-0" />
            <p className="text-xs text-brand-amber font-medium">
              <strong>{stats.expiringSoonMovies} film(s)</strong> have licenses expiring within 14 days. Prepare extensions or written renewals.
            </p>
          </div>
          <Link
            href="/admin/licenses"
            className="text-xs font-semibold text-brand-amber hover:underline whitespace-nowrap"
          >
            View Titles
          </Link>
        </div>
      )}

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Films */}
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-card hover:border-brand-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
              Film Library
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-amber/15 text-brand-amber flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-brand-text">
              {stats?.totalMovies || 0}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-brand-green/20 text-brand-green font-medium">
                {stats?.activeLicensedMovies || 0} Licensed & Active
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Views */}
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-card hover:border-brand-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
              Total Stream Views
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-green/15 text-brand-green flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-brand-text">
              {(stats?.totalViews || 0).toLocaleString()}
            </div>
            <p className="mt-2 text-xs text-brand-text-muted">
              Free streaming audience across Rwanda
            </p>
          </div>
        </div>

        {/* Card 3: Cloudflare R2 Storage */}
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-card hover:border-brand-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
              R2 Storage Used
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-blue/15 text-brand-blue flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-brand-text">
              {formatBytes(stats?.estimatedStorageBytes ? BigInt(stats.estimatedStorageBytes) : BigInt(0))}
            </div>
            <p className="mt-2 text-xs text-brand-text-muted">
              Direct-to-R2 (no server disk burden)
            </p>
          </div>
        </div>

        {/* Card 4: Bandwidth */}
        <div className="p-6 rounded-3xl bg-brand-surface border border-brand-border shadow-card hover:border-brand-border/80 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
              Estimated Bandwidth
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-amber/15 text-brand-amber flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-brand-text">
              {formatBytes(stats?.estimatedBandwidthBytes ? BigInt(stats.estimatedBandwidthBytes) : BigInt(0))}
            </div>
            <p className="mt-2 text-xs text-brand-green font-medium">
              Cloudflare CDN Zero-Egress Tier
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Popular Movies & Copyright Reports Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Most Popular Movies Table (2 cols) */}
        <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-brand-text">Most Streamed Movies</h3>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Top audience favorites on mobile and desktop
              </p>
            </div>
            <Link
              href="/admin/movies"
              className="text-xs font-semibold text-brand-amber hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-muted text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Film Title</th>
                  <th className="pb-3 font-semibold">Kinyarwanda</th>
                  <th className="pb-3 font-semibold">Views</th>
                  <th className="pb-3 font-semibold">License Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {stats?.popularMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-brand-surface-hover/50 transition-colors">
                    <td className="py-3.5 pr-4 flex items-center gap-3">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-xl border border-brand-border flex-shrink-0"
                      />
                      <div>
                        <Link
                          href={`/admin/movies?edit=${movie.id}`}
                          className="font-semibold text-brand-text hover:text-brand-amber transition-colors line-clamp-1"
                        >
                          {movie.title}
                        </Link>
                        {movie.titleRw && (
                          <span className="text-xs text-brand-text-muted block line-clamp-1">
                            {movie.titleRw}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 pr-4 text-xs">
                      {movie.hasKinyarwanda ? (
                        <span className="px-2 py-0.5 rounded-md bg-brand-amber/20 text-brand-amber font-semibold">
                          Available
                        </span>
                      ) : (
                        <span className="text-brand-text-muted">English Only</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4 text-xs font-bold text-brand-text">
                      {movie.viewsCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 text-xs">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          movie.licenseStatus === 'LICENSED'
                            ? 'bg-brand-green/20 text-brand-green border-brand-green/40'
                            : 'bg-brand-coral/20 text-brand-coral border-brand-coral/40'
                        }`}
                      >
                        {movie.licenseStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel: Legal Compliance & Quick Insights (1 col) */}
        <div className="space-y-6">
          {/* Copyright DMCA Card */}
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-coral/15 text-brand-coral flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-text">Copyright & DMCA Inquiries</h4>
                <p className="text-xs text-brand-text-muted">Rights owner submissions</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-brand-text-muted">Pending Claims:</span>
                <span className="font-bold text-brand-coral">
                  {stats?.pendingReportsCount || 0}
                </span>
              </div>
            </div>

            <Link
              href="/admin/reports"
              className="block w-full py-2.5 text-center rounded-xl bg-brand-surface-hover hover:bg-brand-surface-hover/80 text-brand-text text-xs font-semibold border border-brand-border transition-all"
            >
              Open DMCA Center
            </Link>
          </div>

          {/* Quick System Summary Card */}
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-card space-y-4">
            <h4 className="text-sm font-bold text-brand-text">Platform Summary</h4>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-brand-border/50">
                <span className="text-brand-text-muted">Registered Users:</span>
                <span className="font-semibold text-brand-text">{stats?.usersCount || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-brand-border/50">
                <span className="text-brand-text-muted">Audience Comments:</span>
                <span className="font-semibold text-brand-text">{stats?.commentsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-brand-border/50">
                <span className="text-brand-text-muted">Hosting Infrastructure:</span>
                <span className="font-semibold text-brand-green">Cloudflare R2 + Next.js</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-brand-text-muted">Legal Compliance:</span>
                <span className="font-semibold text-brand-amber">Strict Auto-Expiry Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

