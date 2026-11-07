'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Heart, Clock, Languages, Film } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';

export interface MovieCardData {
  id: string;
  title: string;
  titleRw?: string | null;
  slug: string;
  posterUrl: string;
  releaseYear: number;
  durationMinutes: number;
  ageRating: string;
  hasKinyarwanda: boolean;
  quality?: string;
  viewsCount?: number;
}

export function MovieCard({ movie }: { movie: MovieCardData }) {
  const { language, t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check localStorage for favorites
    try {
      const saved = localStorage.getItem('nr_favorites');
      if (saved) {
        const list: string[] = JSON.parse(saved);
        setIsFavorite(list.includes(movie.id));
      }
    } catch {
      // Ignore storage errors
    }
  }, [movie.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const displayTitle = language === 'rw' && movie.titleRw ? movie.titleRw : movie.title;

  return (
    <div className="group relative flex flex-col flex-shrink-0 w-44 sm:w-52 transition-all duration-300">
      {/* Poster Container */}
      <Link
        href={`/movie/${movie.slug}`}
        className="relative aspect-[2/3] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-brand-surface border border-brand-border/60 shadow-card group-hover:shadow-amber group-hover:border-brand-amber/40 transition-all duration-300 block"
      >
        <img
          src={movie.posterUrl}
          alt={displayTitle}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          {/* Quality Badge */}
          <span className="px-2 py-0.5 rounded-lg bg-[#1B1F3B]/80 backdrop-blur-sm border border-brand-border/80 text-[10px] font-extrabold text-brand-amber">
            HD
          </span>

          {/* Kinyarwanda Dubbing Badge */}
          {movie.hasKinyarwanda && (
            <span className="px-2 py-0.5 rounded-lg bg-brand-green/90 text-[#1B1F3B] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Languages className="w-2.5 h-2.5" />
              <span>RW</span>
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#1B1F3B]/80 backdrop-blur-sm border border-brand-border/80 flex items-center justify-center text-brand-text hover:scale-110 active:scale-95 transition-all z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-brand-coral text-brand-coral' : 'text-brand-text-muted hover:text-brand-coral'
            }`}
          />
        </button>

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-brand-amber text-[#1B1F3B] flex items-center justify-center shadow-amber transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 ml-0.5 fill-[#1B1F3B]" />
          </div>
        </div>
      </Link>

      {/* Movie Meta Information */}
      <div className="pt-2.5 px-1 space-y-1">
        <Link
          href={`/movie/${movie.slug}`}
          className="block font-bold text-sm text-brand-text hover:text-brand-amber transition-colors line-clamp-1"
          title={displayTitle}
        >
          {displayTitle}
        </Link>

        <div className="flex items-center justify-between text-[11px] text-brand-text-muted">
          <span>{movie.releaseYear}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(movie.durationMinutes)}
          </span>
          <span>•</span>
          <span className="px-1.5 py-0.2 rounded bg-brand-surface border border-brand-border/60 text-[10px]">
            {movie.ageRating}
          </span>
        </div>
      </div>
    </div>
  );
}

