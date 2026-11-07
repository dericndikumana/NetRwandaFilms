'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Film, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { MovieCard, MovieCardData } from '@/components/public/movie-card';
import { useLanguage } from '@/components/language-provider';

export default function FavoritesPage() {
  const { language, t } = useLanguage();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true);
        const saved = localStorage.getItem('nr_favorites');
        const ids: string[] = saved ? JSON.parse(saved) : [];
        setFavoriteIds(ids);

        if (ids.length > 0) {
          const res = await fetch('/api/movies');
          if (res.ok) {
            const data = await res.json();
            const allMovies: MovieCardData[] = data.movies || [];
            const matched = allMovies.filter((m) => ids.includes(m.id));
            setFavoriteMovies(matched);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  const handleClearAll = () => {
    if (!confirm('Remove all movies from your list?')) return;
    localStorage.removeItem('nr_favorites');
    setFavoriteIds([]);
    setFavoriteMovies([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-border/60 pb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-text tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-brand-coral fill-brand-coral" />
              <span>{t('favorites')}</span>
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted mt-1">
              Your personal library of bookmarked Rwandan and international cinema.
            </p>
          </div>

          {favoriteMovies.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-brand-coral hover:bg-brand-coral/10 border border-brand-coral/30 transition-colors w-fit"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear List</span>
            </button>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="p-16 text-center text-brand-text-muted flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-sm">Retrieving your saved list...</p>
          </div>
        ) : favoriteMovies.length === 0 ? (
          <div className="py-20 text-center bg-brand-surface border border-brand-border rounded-3xl p-8 max-w-lg mx-auto space-y-4 shadow-card">
            <div className="w-16 h-16 rounded-3xl bg-brand-coral/15 text-brand-coral flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-text">Your list is currently empty</h2>
              <p className="text-xs text-brand-text-muted mt-1 max-w-xs mx-auto">
                Explore our catalog and tap the heart icon on any movie poster to save it for later.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-bold text-xs shadow-amber transition-all cursor-pointer"
            >
              <span>Explore Movies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {favoriteMovies.map((movie) => (
              <div key={movie.id} className="w-full flex justify-center">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
