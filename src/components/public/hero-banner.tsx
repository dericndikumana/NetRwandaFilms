'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight, Languages, Clock, Sparkles } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';

export interface BannerData {
  id: string;
  title?: string | null;
  titleRw?: string | null;
  tagline?: string | null;
  taglineRw?: string | null;
  imageUrl?: string | null;
  movie: {
    id: string;
    title: string;
    titleRw?: string | null;
    slug: string;
    synopsis: string;
    synopsisRw?: string | null;
    bannerUrl: string;
    posterUrl: string;
    durationMinutes: number;
    releaseYear: number;
    ageRating: string;
    hasKinyarwanda: boolean;
  };
}

export function HeroBanner({ banners }: { banners: BannerData[] }) {
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance hero carousel every 8 seconds
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const current = banners[currentIndex];
  const movie = current.movie;

  const displayTitle =
    language === 'rw' && (current.titleRw || movie.titleRw)
      ? current.titleRw || movie.titleRw
      : current.title || movie.title;

  const displayTagline =
    language === 'rw' && current.taglineRw
      ? current.taglineRw
      : current.tagline || 'Featured Rwandan & Global Cinema';

  const displaySynopsis =
    language === 'rw' && movie.synopsisRw ? movie.synopsisRw : movie.synopsis;

  const displayImage = current.imageUrl || movie.bannerUrl;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] lg:aspect-[24/9] max-h-[580px] overflow-hidden rounded-3xl bg-brand-surface border border-brand-border/60 shadow-soft select-none group">
      {/* Background Hero Image */}
      <img
        src={displayImage}
        alt={displayTitle || 'Featured Movie'}
        className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
      />

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] via-[#1B1F3B]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#1B1F3B] via-[#1B1F3B]/70 to-transparent hidden sm:block" />

      {/* Slide Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-3xl">
        {/* Tagline Badge */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-amber text-[#1B1F3B] text-[11px] font-black uppercase tracking-wider shadow-amber">
            <Sparkles className="w-3 h-3 fill-[#1B1F3B]" />
            <span>{displayTagline}</span>
          </span>

          {movie.hasKinyarwanda && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-green/90 text-[#1B1F3B] text-[11px] font-black uppercase tracking-wider">
              <Languages className="w-3 h-3" />
              <span>Ikinyarwanda</span>
            </span>
          )}
        </div>

        {/* Film Title */}
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-text tracking-tight leading-tight line-clamp-2">
          {displayTitle}
        </h2>

        {/* Metadata Pills */}
        <div className="flex items-center gap-3 text-xs text-brand-text-muted mt-2 sm:mt-3">
          <span className="font-bold text-brand-amber">{movie.releaseYear}</span>
          <span>•</span>
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(movie.durationMinutes)}
          </span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border text-[11px] font-bold">
            {movie.ageRating}
          </span>
        </div>

        {/* Synopsis snippet */}
        <p className="text-xs sm:text-sm text-brand-text-muted/90 mt-2 sm:mt-3 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl">
          {displaySynopsis}
        </p>

        {/* Large Action Buttons */}
        <div className="flex items-center gap-3 mt-4 sm:mt-6">
          <Link
            href={`/watch/${movie.slug}`}
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-extrabold text-sm sm:text-base shadow-amber transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-[#1B1F3B]" />
            <span>{t('watchNow')}</span>
          </Link>

          <Link
            href={`/movie/${movie.slug}`}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl bg-brand-surface/90 hover:bg-brand-surface text-brand-text border border-brand-border text-xs sm:text-sm font-bold backdrop-blur-sm transition-all"
          >
            <Info className="w-4 h-4 text-brand-amber" />
            <span>Details</span>
          </Link>
        </div>
      </div>

      {/* Manual Left/Right Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            type="button"
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1B1F3B]/70 border border-brand-border text-brand-text flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-surface"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            type="button"
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1B1F3B]/70 border border-brand-border text-brand-text flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-surface"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-4 right-6 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-6 bg-brand-amber' : 'w-2 bg-brand-text-muted/40'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

