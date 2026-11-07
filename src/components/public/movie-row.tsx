'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { MovieCard, MovieCardData } from './movie-card';
import { useLanguage } from '@/components/language-provider';

interface MovieRowProps {
  title: string;
  titleRw?: string | null;
  slug?: string;
  movies: MovieCardData[];
}

export function MovieRow({ title, titleRw, slug, movies }: MovieRowProps) {
  const { language } = useLanguage();
  const rowRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  const displayTitle = language === 'rw' && titleRw ? titleRw : title;

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="space-y-4">
      {/* Category Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 rounded-full bg-brand-amber" />
          <h3 className="text-lg sm:text-xl font-extrabold text-brand-text tracking-tight">
            {displayTitle}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {slug && (
            <Link
              href={`/search?category=${slug}`}
              className="text-xs font-bold text-brand-amber hover:text-brand-amber/80 flex items-center gap-1 transition-colors mr-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Desktop Left / Right Scroll Chevrons */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() => scroll('left')}
              type="button"
              aria-label="Scroll left"
              className="p-1.5 rounded-xl bg-brand-surface hover:bg-brand-surface-hover text-brand-text-muted hover:text-brand-text border border-brand-border transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              type="button"
              aria-label="Scroll right"
              className="p-1.5 rounded-xl bg-brand-surface hover:bg-brand-surface-hover text-brand-text-muted hover:text-brand-text border border-brand-border transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
      <div
        ref={rowRef}
        className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 px-1 scroll-smooth"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

