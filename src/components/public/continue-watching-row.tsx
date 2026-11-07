'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, X, Clock, History } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';

interface ProgressItem {
  movieId: string;
  movieSlug: string;
  movieTitle: string;
  movieTitleRw?: string | null;
  posterUrl: string;
  progressSeconds: number;
  durationSeconds: number;
  language: 'en' | 'rw';
  updatedAt: string;
}

export function ContinueWatchingRow() {
  const { language, t } = useLanguage();
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSavedProgress();
  }, []);

  const loadSavedProgress = () => {
    try {
      const foundItems: ProgressItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('nr_progress_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (data && data.progressSeconds > 15 && !data.completed) {
              foundItems.push(data);
            }
          }
        }
      }

      // Sort by most recently watched
      foundItems.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setItems(foundItems);
    } catch {
      // Ignore
    }
  };

  const removeItem = (e: React.MouseEvent, movieId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.removeItem(`nr_progress_${movieId}`);
      setItems((prev) => prev.filter((item) => item.movieId !== movieId));
    } catch {
      // Ignore
    }
  };

  if (!mounted || items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-5 rounded-full bg-brand-amber" />
          <h3 className="text-lg sm:text-xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-brand-amber" />
            <span>{t('continueWatching')}</span>
          </h3>
        </div>
      </div>

      <div className="flex items-start gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 px-1 scroll-smooth">
        {items.map((item) => {
          const progressPercent = Math.min(
            100,
            Math.round((item.progressSeconds / (item.durationSeconds || 1)) * 100)
          );
          const remainingSeconds = Math.max(0, item.durationSeconds - item.progressSeconds);
          const remainingMins = Math.ceil(remainingSeconds / 60);

          const displayTitle =
            language === 'rw' && item.movieTitleRw ? item.movieTitleRw : item.movieTitle;

          return (
            <div
              key={item.movieId}
              className="group relative flex flex-col flex-shrink-0 w-48 sm:w-56 transition-all duration-300"
            >
              {/* Card Container */}
              <Link
                href={`/watch/${item.movieSlug}?t=${Math.floor(item.progressSeconds)}&lang=${item.language}`}
                className="relative aspect-video w-full rounded-2xl overflow-hidden bg-brand-surface border border-brand-border/60 shadow-card group-hover:border-brand-amber/50 transition-all block"
              >
                <img
                  src={item.posterUrl}
                  alt={displayTitle || 'Movie'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B1F3B] via-transparent to-transparent opacity-80" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-brand-amber text-[#1B1F3B] flex items-center justify-center shadow-amber">
                    <Play className="w-4 h-4 ml-0.5 fill-[#1B1F3B]" />
                  </div>
                </div>

                {/* Remove from history button */}
                <button
                  type="button"
                  onClick={(e) => removeItem(e, item.movieId)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#1B1F3B]/80 border border-brand-border text-brand-text-muted hover:text-brand-coral flex items-center justify-center transition-colors z-10"
                  title="Remove from history"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* Progress Bar Track */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#1B1F3B]/90">
                  <div
                    className="h-full bg-brand-amber transition-all rounded-r-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </Link>

              {/* Title and Remaining Time */}
              <div className="pt-2 px-1">
                <Link
                  href={`/watch/${item.movieSlug}?t=${Math.floor(item.progressSeconds)}&lang=${item.language}`}
                  className="block font-bold text-xs sm:text-sm text-brand-text hover:text-brand-amber transition-colors line-clamp-1"
                >
                  {displayTitle || 'Resume Film'}
                </Link>
                <div className="flex items-center justify-between text-[11px] text-brand-text-muted mt-0.5">
                  <span className="font-semibold text-brand-amber">
                    {progressPercent}% watched
                  </span>
                  <span>{remainingMins}m left</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
