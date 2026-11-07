'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Film,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Check,
  X,
  Clock,
  Eye,
  FileCheck2,
  Loader2,
  Languages,
} from 'lucide-react';
import { FileUploader } from '@/components/admin/file-uploader';
import { formatDuration } from '@/lib/utils';
import { evaluateMovieLicense } from '@/lib/license';

interface Category {
  id: string;
  name: string;
  nameRw: string;
  slug: string;
}

interface Movie {
  id: string;
  title: string;
  titleRw?: string | null;
  slug: string;
  synopsis: string;
  synopsisRw?: string | null;
  releaseYear: number;
  durationMinutes: number;
  ageRating: string;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl?: string | null;
  videoUrl: string;
  videoKey?: string | null;
  video480pUrl?: string | null;
  video720pUrl?: string | null;
  video1080pUrl?: string | null;
  subtitlesUrl?: string | null;
  subtitlesRwUrl?: string | null;
  hasKinyarwanda: boolean;
  kinyarwandaType: 'NONE' | 'AUDIO_TRACK' | 'SEPARATE_VIDEO';
  kinyarwandaAudioUrl?: string | null;
  kinyarwandaVideoUrl?: string | null;
  licenseStatus: 'LICENSED' | 'EXPIRED' | 'PENDING_REVIEW' | 'REVOKED';
  licenseOwner: string;
  licenseContact?: string | null;
  licenseStart: string;
  licenseExpires: string;
  licenseNotes?: string | null;
  licenseDocUrl?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  featuredOrder: number;
  viewsCount: number;
  categories: Category[];
}

export default function AdminMoviesPage() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [titleRw, setTitleRw] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [synopsisRw, setSynopsisRw] = useState('');
  const [releaseYear, setReleaseYear] = useState(new Date().getFullYear().toString());
  const [durationMinutes, setDurationMinutes] = useState('90');
  const [ageRating, setAgeRating] = useState('13+');
  const [posterUrl, setPosterUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [video480pUrl, setVideo480pUrl] = useState('');
  const [video720pUrl, setVideo720pUrl] = useState('');
  const [video1080pUrl, setVideo1080pUrl] = useState('');
  const [subtitlesUrl, setSubtitlesUrl] = useState('');
  const [subtitlesRwUrl, setSubtitlesRwUrl] = useState('');

  // Kinyarwanda Dubbing
  const [hasKinyarwanda, setHasKinyarwanda] = useState(false);
  const [kinyarwandaType, setKinyarwandaType] = useState<'NONE' | 'AUDIO_TRACK' | 'SEPARATE_VIDEO'>('AUDIO_TRACK');
  const [kinyarwandaAudioUrl, setKinyarwandaAudioUrl] = useState('');
  const [kinyarwandaVideoUrl, setKinyarwandaVideoUrl] = useState('');

  // Legal Licensing
  const [licenseStatus, setLicenseStatus] = useState<'LICENSED' | 'EXPIRED' | 'PENDING_REVIEW' | 'REVOKED'>('LICENSED');
  const [licenseOwner, setLicenseOwner] = useState('');
  const [licenseContact, setLicenseContact] = useState('');
  const [licenseStart, setLicenseStart] = useState(new Date().toISOString().split('T')[0]);
  const [licenseExpires, setLicenseExpires] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [licenseNotes, setLicenseNotes] = useState('');
  const [licenseDocUrl, setLicenseDocUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState('0');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const fetchMoviesAndCategories = async () => {
    try {
      setLoading(true);
      const [moviesRes, categoriesRes] = await Promise.all([
        fetch('/api/movies?includeExpired=true'),
        fetch('/api/categories'),
      ]);

      if (moviesRes.ok && categoriesRes.ok) {
        const moviesData = await moviesRes.json();
        const categoriesData = await categoriesRes.json();
        setMovies(moviesData.movies || []);
        setCategories(categoriesData.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoviesAndCategories();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      openCreateModal();
    }
  }, [searchParams]);

  const openCreateModal = () => {
    setEditingMovie(null);
    setTitle('');
    setTitleRw('');
    setSynopsis('');
    setSynopsisRw('');
    setReleaseYear(new Date().getFullYear().toString());
    setDurationMinutes('90');
    setAgeRating('13+');
    setPosterUrl('');
    setBannerUrl('');
    setTrailerUrl('');
    setVideoUrl('');
    setVideoKey('');
    setVideo480pUrl('');
    setVideo720pUrl('');
    setVideo1080pUrl('');
    setSubtitlesUrl('');
    setSubtitlesRwUrl('');
    setHasKinyarwanda(false);
    setKinyarwandaType('AUDIO_TRACK');
    setKinyarwandaAudioUrl('');
    setKinyarwandaVideoUrl('');
    setLicenseStatus('LICENSED');
    setLicenseOwner('');
    setLicenseContact('');
    setLicenseStart('');
    setLicenseExpires('');
    setLicenseNotes('');
    setLicenseDocUrl('');
    setIsPublished(true);
    setIsFeatured(false);
    setFeaturedOrder('0');
    setSelectedCategoryIds([]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setTitleRw(movie.titleRw || '');
    setSynopsis(movie.synopsis);
    setSynopsisRw(movie.synopsisRw || '');
    setReleaseYear(movie.releaseYear.toString());
    setDurationMinutes(movie.durationMinutes.toString());
    setAgeRating(movie.ageRating);
    setPosterUrl(movie.posterUrl);
    setBannerUrl(movie.bannerUrl);
    setTrailerUrl(movie.trailerUrl || '');
    setVideoUrl(movie.videoUrl);
    setVideoKey(movie.videoKey || '');
    setVideo480pUrl(movie.video480pUrl || '');
    setVideo720pUrl(movie.video720pUrl || '');
    setVideo1080pUrl(movie.video1080pUrl || '');
    setSubtitlesUrl(movie.subtitlesUrl || '');
    setSubtitlesRwUrl(movie.subtitlesRwUrl || '');
    setHasKinyarwanda(movie.hasKinyarwanda);
    setKinyarwandaType(movie.kinyarwandaType);
    setKinyarwandaAudioUrl(movie.kinyarwandaAudioUrl || '');
    setKinyarwandaVideoUrl(movie.kinyarwandaVideoUrl || '');
    setLicenseStatus(movie.licenseStatus);
    setLicenseOwner(movie.licenseOwner || '');
    setLicenseContact(movie.licenseContact || '');
    setLicenseStart(movie.licenseStart ? new Date(movie.licenseStart).toISOString().split('T')[0] : '');
    setLicenseExpires(movie.licenseExpires ? new Date(movie.licenseExpires).toISOString().split('T')[0] : '');
    setLicenseNotes(movie.licenseNotes || '');
    setLicenseDocUrl(movie.licenseDocUrl || '');
    setIsPublished(movie.isPublished);
    setIsFeatured(movie.isFeatured);
    setFeaturedOrder(movie.featuredOrder.toString());
    setSelectedCategoryIds(movie.categories.map((c) => c.id));
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title || !synopsis || !releaseYear || !durationMinutes || !posterUrl || !bannerUrl || !videoUrl) {
      setFormError('Please fill in all mandatory film metadata and media files (title, synopsis, year, duration, poster, banner, video).');
      return;
    }

    setSaving(true);

    const payload = {
      title,
      titleRw,
      synopsis,
      synopsisRw,
      releaseYear: parseInt(releaseYear, 10),
      durationMinutes: parseInt(durationMinutes, 10),
      ageRating,
      posterUrl,
      bannerUrl,
      trailerUrl,
      videoUrl,
      videoKey,
      video480pUrl,
      video720pUrl,
      video1080pUrl,
      subtitlesUrl,
      subtitlesRwUrl,
      hasKinyarwanda,
      kinyarwandaType: hasKinyarwanda ? kinyarwandaType : 'NONE',
      kinyarwandaAudioUrl,
      kinyarwandaVideoUrl,
      licenseStatus,
      licenseOwner: licenseOwner || null,
      licenseContact: licenseContact || null,
      licenseStart: licenseStart ? licenseStart : null,
      licenseExpires: licenseExpires ? licenseExpires : null,
      licenseNotes: licenseNotes || null,
      licenseDocUrl,
      isPublished,
      isFeatured,
      featuredOrder: parseInt(featuredOrder, 10),
      categoryIds: selectedCategoryIds,
    };

    try {
      const url = editingMovie ? `/api/movies/${editingMovie.id}` : '/api/movies';
      const method = editingMovie ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save film.');
      }

      setIsModalOpen(false);
      await fetchMoviesAndCategories();
    } catch (err: any) {
      setFormError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMovie = async (movieId: string, movieTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${movieTitle}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/movies/${movieId}`, { method: 'DELETE' });
      if (res.ok) {
        setMovies(movies.filter((m) => m.id !== movieId));
      } else {
        alert('Failed to delete movie. Ensure you have Super Admin role.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  const filteredMovies = movies.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.titleRw && m.titleRw.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.licenseOwner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || m.categories.some((c) => c.slug === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight">
            Movie & Media Catalog
          </h2>
          <p className="text-sm text-brand-text-muted mt-1">
            Manage movie files, Kinyarwanda audio tracks, HLS streams, and copyright licenses.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-semibold text-sm shadow-amber transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Movie</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-brand-surface border border-brand-border rounded-2xl p-4 shadow-card">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, Rwandan title, or copyright owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text placeholder-brand-text-muted/60 text-sm focus:outline-none focus:border-brand-amber"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-brand-text-muted" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name} ({c.nameRw})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Movies Table */}
      <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-brand-text-muted flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-sm">Loading film catalog...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="p-12 text-center text-brand-text-muted">
            <Film className="w-12 h-12 mx-auto text-brand-text-muted/40 mb-3" />
            <p className="font-semibold text-brand-text">No movies found</p>
            <p className="text-xs mt-1">Try adjusting your search or add a new film.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-muted text-xs uppercase tracking-wider bg-brand-bg/40">
                  <th className="py-4 px-6 font-semibold">Film Title</th>
                  <th className="py-4 px-4 font-semibold">Kinyarwanda</th>
                  <th className="py-4 px-4 font-semibold">License Rights</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Views</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filteredMovies.map((movie) => {
                  const licenseInfo = evaluateMovieLicense(movie);
                  return (
                    <tr key={movie.id} className="hover:bg-brand-surface-hover/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded-xl border border-brand-border flex-shrink-0"
                          />
                          <div>
                            <div className="font-bold text-brand-text flex items-center gap-2">
                              <span>{movie.title}</span>
                              {movie.isFeatured && (
                                <span className="px-2 py-0.5 rounded-md bg-brand-amber/20 text-brand-amber text-[10px] font-bold">
                                  Featured
                                </span>
                              )}
                            </div>
                            {movie.titleRw && (
                              <p className="text-xs text-brand-text-muted">{movie.titleRw}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-brand-text-muted mt-1">
                              <span>{movie.releaseYear}</span>
                              <span>•</span>
                              <span>{formatDuration(movie.durationMinutes)}</span>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-brand-surface border border-brand-border text-[10px]">
                                {movie.ageRating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {movie.hasKinyarwanda ? (
                          <div className="flex items-center gap-1.5 text-xs text-brand-amber font-semibold">
                            <Languages className="w-4 h-4" />
                            <span>
                              {movie.kinyarwandaType === 'AUDIO_TRACK' ? '2nd Audio' : 'Dubbed Video'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-brand-text-muted">English Only</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs">
                        <div className="font-semibold text-brand-text line-clamp-1">
                          {movie.licenseOwner}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${licenseInfo.badgeClass}`}
                          >
                            {licenseInfo.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs">
                        {movie.isPublished && licenseInfo.isValid ? (
                          <span className="inline-flex items-center gap-1 text-brand-green font-medium">
                            <Check className="w-3.5 h-3.5" /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-brand-coral font-medium">
                            <X className="w-3.5 h-3.5" /> Auto-Hidden
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs font-bold text-brand-text">
                        {movie.viewsCount.toLocaleString()}
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(movie)}
                          className="p-2 rounded-xl text-brand-text-muted hover:text-brand-amber hover:bg-brand-surface-hover transition-colors"
                          title="Edit Film"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie.id, movie.title)}
                          className="p-2 rounded-xl text-brand-text-muted hover:text-brand-coral hover:bg-brand-surface-hover transition-colors"
                          title="Delete Film"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1F3B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-soft">
            <div className="flex items-center justify-between pb-6 border-b border-brand-border">
              <div>
                <h3 className="text-xl font-bold text-brand-text">
                  {editingMovie ? 'Edit Movie Record' : 'Upload New Licensed Film'}
                </h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Direct streaming to Cloudflare R2 with dual-track language support.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-brand-text-muted hover:text-brand-text rounded-xl hover:bg-brand-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-4 rounded-2xl bg-brand-coral/15 border border-brand-coral/30 text-brand-coral text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveMovie} className="space-y-8 mt-6">
              {/* SECTION 1: General Film Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-brand-amber uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4" /> 1. General Film Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Film Title (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. The Hills of Kigali"
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Film Title (Kinyarwanda Translation)
                    </label>
                    <input
                      type="text"
                      value={titleRw}
                      onChange={(e) => setTitleRw(e.target.value)}
                      placeholder="e.g. Imisozi ya Kigali"
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Synopsis (English) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      placeholder="Story overview in English..."
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Synopsis (Kinyarwanda)
                    </label>
                    <textarea
                      rows={3}
                      value={synopsisRw}
                      onChange={(e) => setSynopsisRw(e.target.value)}
                      placeholder="Incamake ya filime mu Kinyarwanda..."
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Release Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={releaseYear}
                      onChange={(e) => setReleaseYear(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Duration (Minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Age Rating
                    </label>
                    <select
                      value={ageRating}
                      onChange={(e) => setAgeRating(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    >
                      <option value="All">All Audiences</option>
                      <option value="13+">13+ Teen</option>
                      <option value="16+">16+ Mature</option>
                      <option value="18+">18+ Adults</option>
                    </select>
                  </div>
                </div>

                {/* Categories Checkboxes */}
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-2">
                    Film Categories & Genres
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => {
                      const isChecked = selectedCategoryIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== c.id));
                            } else {
                              setSelectedCategoryIds([...selectedCategoryIds, c.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                            isChecked
                              ? 'bg-brand-amber text-[#1B1F3B] border-brand-amber font-semibold'
                              : 'bg-brand-bg/60 text-brand-text-muted border-brand-border hover:border-brand-border/80'
                          }`}
                        >
                          {c.name} ({c.nameRw})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* SECTION 2: Media Assets & Artwork */}
              <div className="space-y-4 pt-6 border-t border-brand-border">
                <h4 className="text-sm font-bold text-brand-amber uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4" /> 2. Posters, Banners & Teaser
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FileUploader
                    label="Vertical Movie Poster *"
                    accept="image/*"
                    folder="posters"
                    currentUrl={posterUrl}
                    onUploadComplete={(url) => setPosterUrl(url)}
                    helperText="Portrait ratio 2:3 (e.g. 600x900px)"
                  />
                  <FileUploader
                    label="Wide Hero Banner *"
                    accept="image/*"
                    folder="banners"
                    currentUrl={bannerUrl}
                    onUploadComplete={(url) => setBannerUrl(url)}
                    helperText="Landscape ratio 16:9 (e.g. 1920x1080px)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                    Teaser Trailer Video URL (optional)
                  </label>
                  <input
                    type="url"
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                    placeholder="https://.../trailer.mp4"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                  />
                </div>
              </div>

              {/* SECTION 3: Video Streaming Engine */}
              <div className="space-y-4 pt-6 border-t border-brand-border">
                <h4 className="text-sm font-bold text-brand-amber uppercase tracking-wider flex items-center gap-2">
                  <Film className="w-4 h-4" /> 3. Video Streaming Source (Cloudflare R2 Direct Upload)
                </h4>
                <FileUploader
                  label="Master Video File (MP4 or HLS .m3u8) *"
                  accept="video/*"
                  folder="videos"
                  currentUrl={videoUrl}
                  onUploadComplete={(url, key) => {
                    setVideoUrl(url);
                    setVideoKey(key);
                  }}
                  helperText="Uploads directly to R2 bucket with real-time percentage progress"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1">
                      480p Stream URL (Mobile Optimized)
                    </label>
                    <input
                      type="url"
                      value={video480pUrl}
                      onChange={(e) => setVideo480pUrl(e.target.value)}
                      placeholder="Optional 480p source"
                      className="w-full px-3 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1">
                      720p Stream URL
                    </label>
                    <input
                      type="url"
                      value={video720pUrl}
                      onChange={(e) => setVideo720pUrl(e.target.value)}
                      placeholder="Optional 720p source"
                      className="w-full px-3 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1">
                      1080p Stream URL
                    </label>
                    <input
                      type="url"
                      value={video1080pUrl}
                      onChange={(e) => setVideo1080pUrl(e.target.value)}
                      placeholder="Optional 1080p source"
                      className="w-full px-3 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1">
                      English Subtitles (WebVTT .vtt URL)
                    </label>
                    <input
                      type="url"
                      value={subtitlesUrl}
                      onChange={(e) => setSubtitlesUrl(e.target.value)}
                      placeholder="https://.../subs-en.vtt"
                      className="w-full px-3 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1">
                      Kinyarwanda Subtitles (.vtt URL)
                    </label>
                    <input
                      type="url"
                      value={subtitlesRwUrl}
                      onChange={(e) => setSubtitlesRwUrl(e.target.value)}
                      placeholder="https://.../subs-rw.vtt"
                      className="w-full px-3 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Kinyarwanda Dual-Language Support */}
              <div className="space-y-4 pt-6 border-t border-brand-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-brand-amber uppercase tracking-wider flex items-center gap-2">
                    <Languages className="w-4 h-4" /> 4. Kinyarwanda Dubbed Version
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasKinyarwanda}
                      onChange={(e) => setHasKinyarwanda(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-brand-bg peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1B1F3B] after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-amber" />
                    <span className="ml-3 text-xs font-medium text-brand-text">
                      {hasKinyarwanda ? 'Kinyarwanda Enabled' : 'No Kinyarwanda Track'}
                    </span>
                  </label>
                </div>

                {hasKinyarwanda && (
                  <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-text-muted mb-2">
                        Kinyarwanda Dubbing Type
                      </label>
                      <div className="flex gap-4 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-brand-text">
                          <input
                            type="radio"
                            name="kinyarwandaType"
                            value="AUDIO_TRACK"
                            checked={kinyarwandaType === 'AUDIO_TRACK'}
                            onChange={() => setKinyarwandaType('AUDIO_TRACK')}
                            className="text-brand-amber"
                          />
                          <span>Second Audio Track (Bandwidth efficient)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-brand-text">
                          <input
                            type="radio"
                            name="kinyarwandaType"
                            value="SEPARATE_VIDEO"
                            checked={kinyarwandaType === 'SEPARATE_VIDEO'}
                            onChange={() => setKinyarwandaType('SEPARATE_VIDEO')}
                            className="text-brand-amber"
                          />
                          <span>Separate Dubbed Video Stream</span>
                        </label>
                      </div>
                    </div>

                    {kinyarwandaType === 'AUDIO_TRACK' ? (
                      <FileUploader
                        label="Kinyarwanda Audio Master (.mp3 or .m4a)"
                        accept="audio/*"
                        folder="audio"
                        currentUrl={kinyarwandaAudioUrl}
                        onUploadComplete={(url) => setKinyarwandaAudioUrl(url)}
                        helperText="Synchronized audio track for in-player language toggle"
                      />
                    ) : (
                      <FileUploader
                        label="Kinyarwanda Full Dubbed Video File"
                        accept="video/*"
                        folder="videos"
                        currentUrl={kinyarwandaVideoUrl}
                        onUploadComplete={(url) => setKinyarwandaVideoUrl(url)}
                        helperText="Separate video file with Kinyarwanda voiceover mixed"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 5: Legal Copyright & Licensing */}
              <div className="space-y-4 pt-6 border-t border-brand-border">
                <h4 className="text-sm font-bold text-brand-amber uppercase tracking-wider flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4" /> 5. Legal Rights & Licensing (Optional)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Licensor / Rights Owner Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={licenseOwner}
                      onChange={(e) => setLicenseOwner(e.target.value)}
                      placeholder="e.g. Kigali Motion Pictures Ltd (leave blank if none)"
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Licensor Contact (Optional)
                    </label>
                    <input
                      type="text"
                      value={licenseContact}
                      onChange={(e) => setLicenseContact(e.target.value)}
                      placeholder="licensing@studio.rw"
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      License Start Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={licenseStart}
                      onChange={(e) => setLicenseStart(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      License Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={licenseExpires}
                      onChange={(e) => setLicenseExpires(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      License Status
                    </label>
                    <select
                      value={licenseStatus}
                      onChange={(e) => setLicenseStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    >
                      <option value="LICENSED">Licensed & Active</option>
                      <option value="PENDING_REVIEW">Pending Review</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="REVOKED">Revoked</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      License Agreement Notes
                    </label>
                    <textarea
                      rows={2}
                      value={licenseNotes}
                      onChange={(e) => setLicenseNotes(e.target.value)}
                      placeholder="e.g. Free streaming authorized with advertisement monetization in Rwanda territory..."
                      className="w-full px-4 py-2 rounded-xl bg-brand-bg/70 border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <FileUploader
                      label="Signed Contract / Written Authorization Document"
                      accept=".pdf,image/*"
                      folder="documents"
                      currentUrl={licenseDocUrl}
                      onUploadComplete={(url) => setLicenseDocUrl(url)}
                      helperText="PDF or scanned authorization letter"
                    />
                  </div>
                </div>

                {/* Publish & Featured Toggles */}
                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-text">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="rounded text-brand-amber focus:ring-0"
                    />
                    <span>Publish to Catalog (Subject to active license)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-sm text-brand-text">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-brand-amber focus:ring-0"
                    />
                    <span>Highlight on Featured Banner</span>
                  </label>

                  {isFeatured && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-brand-text-muted">Order:</span>
                      <input
                        type="number"
                        value={featuredOrder}
                        onChange={(e) => setFeaturedOrder(e.target.value)}
                        className="w-16 px-2 py-1 rounded bg-brand-bg/70 border border-brand-border text-brand-text"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-bold text-sm shadow-amber flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Film...</span>
                    </>
                  ) : (
                    <span>{editingMovie ? 'Update Movie' : 'Save & Publish Movie'}</span>
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

