'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Plus, Trash2, Edit2, X, Eye, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { FileUploader } from '@/components/admin/file-uploader';

interface BannerItem {
  id: string;
  movieId: string;
  title?: string | null;
  titleRw?: string | null;
  tagline?: string | null;
  taglineRw?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  order: number;
  movie: {
    id: string;
    title: string;
    titleRw?: string | null;
    slug: string;
    bannerUrl: string;
    posterUrl: string;
    durationMinutes: number;
    releaseYear: number;
    hasKinyarwanda: boolean;
  };
}

interface MovieOption {
  id: string;
  title: string;
  titleRw?: string | null;
  bannerUrl: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [movies, setMovies] = useState<MovieOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customTitleRw, setCustomTitleRw] = useState('');
  const [customTagline, setCustomTagline] = useState('');
  const [customTaglineRw, setCustomTaglineRw] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bannersRes, moviesRes] = await Promise.all([
        fetch('/api/banners'),
        fetch('/api/movies'),
      ]);

      if (bannersRes.ok && moviesRes.ok) {
        const bannersData = await bannersRes.json();
        const moviesData = await moviesRes.json();
        setBanners(bannersData.banners || []);
        setMovies(moviesData.movies || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setSelectedMovieId(movies[0]?.id || '');
    setCustomTitle('');
    setCustomTitleRw('');
    setCustomTagline('Stream Free • Rwandan Cinema');
    setCustomTaglineRw('Reba ku buntu • Filime Nyarwanda');
    setCustomImageUrl('');
    setIsActive(true);
    setOrder((banners.length + 1).toString());
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (b: BannerItem) => {
    setEditingBanner(b);
    setSelectedMovieId(b.movieId);
    setCustomTitle(b.title || '');
    setCustomTitleRw(b.titleRw || '');
    setCustomTagline(b.tagline || '');
    setCustomTaglineRw(b.taglineRw || '');
    setCustomImageUrl(b.imageUrl || '');
    setIsActive(b.isActive);
    setOrder(b.order.toString());
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovieId) {
      setError('Please select a movie to link to this featured hero banner.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: selectedMovieId,
          title: customTitle,
          titleRw: customTitleRw,
          tagline: customTagline,
          taglineRw: customTaglineRw,
          imageUrl: customImageUrl,
          isActive,
          order: parseInt(order, 10),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save banner.');
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving banner.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Remove this featured banner?')) return;

    try {
      const res = await fetch(`/api/banners/${bannerId}`, { method: 'DELETE' });
      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== bannerId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-amber" /> Featured Hero Banners
          </h2>
          <p className="text-sm text-brand-text-muted mt-1">
            Curate the large hero carousel displayed at the top of the MovieBox-style homepage.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-semibold text-sm shadow-amber transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {/* Grid of Banners */}
      {loading ? (
        <div className="p-12 text-center text-brand-text-muted flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
          <p className="text-sm">Loading hero banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center bg-brand-surface border border-brand-border rounded-3xl text-brand-text-muted">
          <Sparkles className="w-12 h-12 mx-auto text-brand-text-muted/40 mb-3" />
          <p className="font-semibold text-brand-text">No featured banners active</p>
          <p className="text-xs mt-1">Create one to highlight premier Rwandan releases on the homepage.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((b) => {
            const displayImage = b.imageUrl || b.movie.bannerUrl;
            return (
              <div
                key={b.id}
                className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-card flex flex-col group"
              >
                {/* Hero Preview Frame */}
                <div className="relative aspect-video w-full overflow-hidden bg-brand-bg">
                  <img
                    src={displayImage}
                    alt={b.title || b.movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] via-[#1B1F3B]/40 to-transparent" />
                  
                  {/* Order & Active Badges */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#1B1F3B]/80 backdrop-blur-sm border border-brand-border text-xs font-bold text-brand-amber">
                      Position #{b.order}
                    </span>
                    {b.isActive ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-green/20 text-brand-green border border-brand-green/40 text-[11px] font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-coral/20 text-brand-coral border border-brand-coral/40 text-[11px] font-semibold">
                        Disabled
                      </span>
                    )}
                  </div>

                  {/* Headline Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-semibold text-brand-amber uppercase tracking-wider">
                      {b.tagline || 'Featured Highlight'}
                    </p>
                    <h4 className="text-lg font-extrabold text-brand-text line-clamp-1">
                      {b.title || b.movie.title}
                    </h4>
                  </div>
                </div>

                {/* Details and Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1 text-xs">
                    <p className="text-brand-text-muted">
                      Linked Film: <strong className="text-brand-text">{b.movie.title}</strong>
                    </p>
                    {b.taglineRw && (
                      <p className="text-brand-green text-[11px]">
                        Kinyarwanda: {b.taglineRw}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-brand-border/60">
                    <span className="text-[11px] text-brand-text-muted">
                      Slug: /watch/{b.movie.slug}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-2 rounded-xl text-brand-text-muted hover:text-brand-amber hover:bg-brand-surface-hover transition-colors"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-2 rounded-xl text-brand-text-muted hover:text-brand-coral hover:bg-brand-surface-hover transition-colors"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1F3B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <h3 className="text-lg font-bold text-brand-text">
                {editingBanner ? 'Edit Featured Banner' : 'Create Featured Hero Banner'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-brand-text-muted hover:text-brand-text rounded-lg hover:bg-brand-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-brand-coral/15 border border-brand-coral/30 text-brand-coral text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Select Movie to Feature *
                </label>
                <select
                  required
                  value={selectedMovieId}
                  onChange={(e) => setSelectedMovieId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} {m.titleRw ? `(${m.titleRw})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                    Custom Title Headline (optional)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Leave blank to use movie title"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                    Custom Headline (Kinyarwanda)
                  </label>
                  <input
                    type="text"
                    value={customTitleRw}
                    onChange={(e) => setCustomTitleRw(e.target.value)}
                    placeholder="Kinyarwanda title override"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                    Badge / Tagline (English)
                  </label>
                  <input
                    type="text"
                    value={customTagline}
                    onChange={(e) => setCustomTagline(e.target.value)}
                    placeholder="e.g. Exclusive Premiere • Free"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                    Badge / Tagline (Kinyarwanda)
                  </label>
                  <input
                    type="text"
                    value={customTaglineRw}
                    onChange={(e) => setCustomTaglineRw(e.target.value)}
                    placeholder="e.g. Ihere ijisho • Ku Buntu"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                  />
                </div>
              </div>

              <FileUploader
                label="Custom Hero Backdrop Image (optional)"
                accept="image/*"
                folder="banners"
                currentUrl={customImageUrl}
                onUploadComplete={(url) => setCustomImageUrl(url)}
                helperText="If omitted, uses the movie's default banner image"
              />

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                    Carousel Slide Position
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-text">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-brand-amber focus:ring-0"
                    />
                    <span>Active on Homepage</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-bold text-xs shadow-amber flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Hero Banner</span>
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

