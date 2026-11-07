'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Share2,
  Heart,
  Clock,
  Calendar,
  Languages,
  Film,
  AlertTriangle,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { VideoPlayer } from '@/components/player/video-player';
import { MovieCard, MovieCardData } from '@/components/public/movie-card';
import { formatDuration } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';

export default function WatchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;
  const initialTime = parseInt(searchParams.get('t') || '0', 10);
  const initialLang = (searchParams.get('lang') === 'rw' ? 'rw' : 'en') as 'en' | 'rw';

  const { language, t } = useLanguage();
  const [movie, setMovie] = useState<any>(null);
  const [upNextMovies, setUpNextMovies] = useState<MovieCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  useEffect(() => {
    async function fetchWatchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/movies?search=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          const found = data.movies?.find((m: any) => m.slug === slug);
          if (found) {
            setMovie(found);

            // Fetch Up Next recommendations
            const firstCat = found.categories?.[0]?.slug;
            const upNextUrl = firstCat ? `/api/movies?category=${firstCat}` : '/api/movies';
            const nextRes = await fetch(upNextUrl);
            if (nextRes.ok) {
              const nextData = await nextRes.json();
              setUpNextMovies(nextData.movies?.filter((m: any) => m.id !== found.id).slice(0, 8) || []);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchWatchData();
  }, [slug]);

  // Check Favorite status
  useEffect(() => {
    if (!movie) return;
    try {
      const saved = localStorage.getItem('nr_favorites');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        setIsFavorite(list.includes(movie.id));
      }
    } catch {
      // Ignore
    }
  }, [movie]);

  // Increment view counter after 20 seconds on page
  useEffect(() => {
    if (!movie || viewCounted) return;
    const timer = setTimeout(() => {
      fetch(`/api/movies/${movie.id}/view`, { method: 'POST' }).catch(() => {});
      setViewCounted(true);
    }, 20000);
    return () => clearTimeout(timer);
  }, [movie, viewCounted]);

  const toggleFavorite = () => {
    if (!movie) return;
    try {
      const saved = localStorage.getItem('nr_favorites');
      let list: string[] = saved ? JSON.parse(saved) : [];
      if (list.includes(movie.id)) {
        list = list.filter((id) => id !== movie.id);
        setIsFavorite(false);
      } else {
        list.push(movie.id);
        setIsFavorite(true);
      }
      localStorage.setItem('nr_favorites', JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: movie.title,
          text: `Watch "${movie.title}" for free on NetRwandaFilms!`,
          url: window.location.href,
        });
      } catch {
        // Fallback
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
        <PublicHeader />
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-brand-text-muted">
          <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
          <p className="text-sm">Preparing high-definition stream...</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
        <PublicHeader />
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
          <Film className="w-12 h-12 text-brand-text-muted/40" />
          <h2 className="text-xl font-bold">Film Stream Not Found</h2>
          <p className="text-xs text-brand-text-muted max-w-md">
            This title is currently not available for streaming.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-brand-amber text-[#1B1F3B] font-bold text-xs"
          >
            Return to Homepage
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const displayTitle = language === 'rw' && movie.titleRw ? movie.titleRw : movie.title;
  const displaySynopsis = language === 'rw' && movie.synopsisRw ? movie.synopsisRw : movie.synopsis;

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-brand-text-muted">
          <Link
            href={`/movie/${movie.slug}`}
            className="inline-flex items-center gap-1 hover:text-brand-amber transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Details</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border font-bold text-brand-amber text-[11px]">
              Free Streaming
            </span>
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="w-full">
          <VideoPlayer
            movie={movie}
            initialLanguage={initialLang}
            initialTime={initialTime}
          />
        </div>

        {/* Under-Player Toolbar & Meta Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Info Column (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-brand-border/60">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
                  {displayTitle}
                </h1>
                <div className="flex items-center gap-3 text-xs text-brand-text-muted mt-1.5">
                  <span className="font-bold text-brand-amber">{movie.releaseYear}</span>
                  <span>•</span>
                  <span>{formatDuration(movie.durationMinutes)}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 rounded bg-brand-surface border border-brand-border text-[10px]">
                    {movie.ageRating}
                  </span>
                  {movie.hasKinyarwanda && (
                    <>
                      <span>•</span>
                      <span className="text-brand-green font-bold flex items-center gap-1">
                        <Languages className="w-3.5 h-3.5" />
                        <span>Kinyarwanda Available</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                    isFavorite
                      ? 'bg-brand-coral/20 border-brand-coral/40 text-brand-coral'
                      : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-hover'
                  }`}
                  title={isFavorite ? 'Remove from My List' : 'Add to My List'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">
                    {isFavorite ? 'Saved' : 'Save'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-brand-text text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  {shareCopied ? (
                    <Check className="w-4 h-4 text-brand-green" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {shareCopied ? 'Link Copied' : 'Share'}
                  </span>
                </button>

                <Link
                  href={`/movie/${movie.slug}`}
                  className="p-2.5 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-surface-hover text-brand-text text-xs font-semibold transition-all"
                  title="Film Details & Comments"
                >
                  Details
                </Link>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                {t('synopsis')}
              </h3>
              <p className="text-sm text-brand-text/90 leading-relaxed max-w-2xl">
                {displaySynopsis}
              </p>
            </div>

            {/* Categories Chips */}
            <div className="flex items-center gap-2 pt-2 flex-wrap">
              <span className="text-xs text-brand-text-muted font-semibold">Genres:</span>
              {movie.categories?.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  className="px-3 py-1 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-amber/50 text-xs font-medium text-brand-text transition-colors"
                >
                  {language === 'rw' ? cat.nameRw : cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Up Next / Recommendations Column (1 col) */}
          <div className="space-y-4 bg-brand-surface/60 border border-brand-border rounded-3xl p-5 shadow-card">
            <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-amber" />
              <span>Recommended Next</span>
            </h3>

            <div className="space-y-3">
              {upNextMovies.length === 0 ? (
                <p className="text-xs text-brand-text-muted">No recommendations available.</p>
              ) : (
                upNextMovies.map((item) => (
                  <Link
                    key={item.id}
                    href={`/watch/${item.slug}`}
                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-brand-surface transition-colors group"
                  >
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded-xl border border-brand-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-brand-text group-hover:text-brand-amber transition-colors truncate">
                        {language === 'rw' && item.titleRw ? item.titleRw : item.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-brand-text-muted mt-1">
                        <span>{item.releaseYear}</span>
                        <span>•</span>
                        <span>{formatDuration(item.durationMinutes)}</span>
                      </div>
                      {item.hasKinyarwanda && (
                        <span className="inline-block px-1.5 py-0.2 rounded bg-brand-green/20 text-brand-green text-[9px] font-bold mt-1">
                          RW Dub
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
