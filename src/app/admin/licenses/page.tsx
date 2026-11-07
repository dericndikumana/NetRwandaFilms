'use client';

import React, { useEffect, useState } from 'react';
import {
  FileCheck2,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  ExternalLink,
  RefreshCw,
  Search,
  Loader2,
  X,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LicenseMovie {
  id: string;
  title: string;
  titleRw?: string | null;
  slug: string;
  posterUrl: string;
  licenseStatus: 'LICENSED' | 'EXPIRED' | 'PENDING_REVIEW' | 'REVOKED';
  licenseOwner: string;
  licenseContact?: string | null;
  licenseStart: string;
  licenseExpires: string;
  licenseNotes?: string | null;
  licenseDocUrl?: string | null;
  isPublished: boolean;
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysLeft: number;
}

export default function AdminLicensesPage() {
  const [movies, setMovies] = useState<LicenseMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Renewal Modal
  const [selectedMovie, setSelectedMovie] = useState<LicenseMovie | null>(null);
  const [renewExpiresDate, setRenewExpiresDate] = useState('');
  const [renewNotes, setRenewNotes] = useState('');
  const [renewing, setRenewing] = useState(false);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/licenses');
      if (res.ok) {
        const data = await res.json();
        setMovies(data.movies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const openRenewModal = (movie: LicenseMovie) => {
    setSelectedMovie(movie);
    // Default renewal: 1 year from current expiry or today
    const currentExpiry = new Date(movie.licenseExpires);
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    setRenewExpiresDate(baseDate.toISOString().split('T')[0]);
    setRenewNotes(movie.licenseNotes || '');
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie || !renewExpiresDate) return;

    setRenewing(true);
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          licenseStatus: 'LICENSED',
          licenseExpires: renewExpiresDate,
          licenseNotes: renewNotes,
          isPublished: true,
        }),
      });

      if (res.ok) {
        setSelectedMovie(null);
        await fetchLicenses();
      } else {
        alert('Failed to update license.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRenewing(false);
    }
  };

  const handleRevoke = async (movieId: string) => {
    if (!confirm('Are you sure you want to revoke this license? The movie will be immediately hidden from public streaming.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId,
          licenseStatus: 'REVOKED',
          isPublished: false,
        }),
      });

      if (res.ok) {
        await fetchLicenses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const activeCount = movies.filter((m) => !m.isExpired && m.licenseStatus === 'LICENSED').length;
  const expiringSoonCount = movies.filter((m) => m.isExpiringSoon).length;
  const expiredCount = movies.filter((m) => m.isExpired || m.licenseStatus === 'EXPIRED').length;
  const revokedCount = movies.filter((m) => m.licenseStatus === 'REVOKED').length;

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.licenseOwner.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'ACTIVE') return matchesSearch && !m.isExpired && m.licenseStatus === 'LICENSED';
    if (filterStatus === 'EXPIRING_SOON') return matchesSearch && m.isExpiringSoon;
    if (filterStatus === 'EXPIRED') return matchesSearch && (m.isExpired || m.licenseStatus === 'EXPIRED');
    if (filterStatus === 'REVOKED') return matchesSearch && m.licenseStatus === 'REVOKED';

    return matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-6 h-6 text-brand-amber" /> Legal Rights & License Manager
        </h2>
        <p className="text-sm text-brand-text-muted mt-1">
          Automated copyright compliance. When a license expires, films are instantaneously hidden from the public catalog.
        </p>
      </div>

      {/* 4 Status Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterStatus('ACTIVE')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filterStatus === 'ACTIVE'
              ? 'bg-brand-green/20 border-brand-green'
              : 'bg-brand-surface border-brand-border hover:border-brand-border/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-brand-green">
            <span>Active & Licensed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-brand-text mt-2">{activeCount}</div>
          <p className="text-[11px] text-brand-text-muted mt-1">Live in public catalog</p>
        </button>

        <button
          onClick={() => setFilterStatus('EXPIRING_SOON')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filterStatus === 'EXPIRING_SOON'
              ? 'bg-brand-amber/20 border-brand-amber'
              : 'bg-brand-surface border-brand-border hover:border-brand-border/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-brand-amber">
            <span>Expiring &le; 14 Days</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-brand-text mt-2">{expiringSoonCount}</div>
          <p className="text-[11px] text-brand-text-muted mt-1">Requires renewal</p>
        </button>

        <button
          onClick={() => setFilterStatus('EXPIRED')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filterStatus === 'EXPIRED'
              ? 'bg-brand-coral/20 border-brand-coral'
              : 'bg-brand-surface border-brand-border hover:border-brand-border/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-brand-coral">
            <span>Expired (Auto-Hidden)</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-brand-text mt-2">{expiredCount}</div>
          <p className="text-[11px] text-brand-text-muted mt-1">Excluded from public site</p>
        </button>

        <button
          onClick={() => setFilterStatus('REVOKED')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            filterStatus === 'REVOKED'
              ? 'bg-brand-coral/20 border-brand-coral'
              : 'bg-brand-surface border-brand-border hover:border-brand-border/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-brand-text-muted">
            <span>Revoked Rights</span>
            <X className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-brand-text mt-2">{revokedCount}</div>
          <p className="text-[11px] text-brand-text-muted mt-1">Cancelled contracts</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-card">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search licenses by film or owner name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text placeholder-brand-text-muted/60 text-sm focus:outline-none focus:border-brand-amber"
          />
        </div>
        {filterStatus !== 'ALL' && (
          <button
            onClick={() => setFilterStatus('ALL')}
            className="text-xs text-brand-amber hover:underline whitespace-nowrap"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      {/* Licenses Table */}
      <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-brand-text-muted flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-sm">Auditing copyright records...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 text-center text-brand-text-muted">
            <FileText className="w-12 h-12 mx-auto text-brand-text-muted/40 mb-3" />
            <p className="font-semibold text-brand-text">No licenses found matching filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-muted text-xs uppercase tracking-wider bg-brand-bg/40">
                  <th className="py-4 px-6 font-semibold">Film Title</th>
                  <th className="py-4 px-4 font-semibold">Rights Holder / Licensor</th>
                  <th className="py-4 px-4 font-semibold">License Window</th>
                  <th className="py-4 px-4 font-semibold">Status & Countdown</th>
                  <th className="py-4 px-4 font-semibold">Written Proof</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-brand-surface-hover/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-10 h-14 object-cover rounded-xl border border-brand-border flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-brand-text line-clamp-1">{movie.title}</p>
                          {movie.titleRw && (
                            <p className="text-xs text-brand-text-muted line-clamp-1">{movie.titleRw}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-brand-text">{movie.licenseOwner}</div>
                      {movie.licenseContact && (
                        <div className="text-xs text-brand-text-muted">{movie.licenseContact}</div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-xs text-brand-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-amber" />
                        <span>
                          {movie.licenseStart ? formatDate(movie.licenseStart) : 'Standard'} &rarr;{' '}
                          {movie.licenseExpires ? formatDate(movie.licenseExpires) : 'No Expiry'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {movie.licenseStatus === 'REVOKED' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-coral/20 text-brand-coral border border-brand-coral/40">
                          Revoked
                        </span>
                      ) : movie.isExpired ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-coral/20 text-brand-coral border border-brand-coral/40">
                          Expired (Auto-Hidden)
                        </span>
                      ) : movie.isExpiringSoon ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-amber/20 text-brand-amber border border-brand-amber/40">
                          Expires in {movie.daysLeft} days
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-green/20 text-brand-green border border-brand-green/40">
                          Active ({movie.daysLeft} days left)
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      {movie.licenseDocUrl ? (
                        <a
                          href={movie.licenseDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Doc</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-brand-text-muted">Direct Email Agreement</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openRenewModal(movie)}
                        className="px-3 py-1.5 rounded-xl bg-brand-amber hover:bg-brand-amber/90 text-[#1B1F3B] text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        title="Renew License Date"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Renew</span>
                      </button>

                      {movie.licenseStatus !== 'REVOKED' && (
                        <button
                          onClick={() => handleRevoke(movie.id)}
                          className="px-2.5 py-1.5 rounded-xl text-xs text-brand-coral hover:bg-brand-coral/10 border border-brand-coral/30 transition-colors"
                          title="Revoke License"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renew License Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1F3B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <h3 className="text-lg font-bold text-brand-text">Renew Film License</h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Extending written permission for "{selectedMovie.title}"
                </p>
              </div>
              <button
                onClick={() => setSelectedMovie(null)}
                className="p-1.5 text-brand-text-muted hover:text-brand-text rounded-lg hover:bg-brand-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-5 mt-6">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Rights Owner
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedMovie.licenseOwner}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/50 border border-brand-border text-brand-text-muted text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  New License Expiration Date *
                </label>
                <input
                  type="date"
                  required
                  value={renewExpiresDate}
                  onChange={(e) => setRenewExpiresDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                />
                <p className="text-[11px] text-brand-text-muted mt-1">
                  Saving an active date will immediately restore this film's visibility to the public website.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Updated Renewal Notes / Terms
                </label>
                <textarea
                  rows={3}
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  placeholder="e.g. License renewed for 1 additional year under addendum #2 signed with producer..."
                  className="w-full px-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setSelectedMovie(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renewing}
                  className="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-bold text-xs shadow-amber flex items-center gap-2 cursor-pointer"
                >
                  {renewing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm License Extension</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

