'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Languages, Calendar, SlidersHorizontal, Film, Loader2 } from 'lucide-react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { MovieCard, MovieCardData } from '@/components/public/movie-card';
import { useLanguage } from '@/components/language-provider';

function SearchContent() {
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLanguage, setSelectedLanguage] = useState<'ALL' | 'RW' | 'EN'>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'NEWEST' | 'DURATION'>('POPULAR');

  const [movies, setMovies] = useState<MovieCardData[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; nameRw: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Load categories and initial movies
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catRes, movRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/movies'),
        ]);

        if (catRes.ok && movRes.ok) {
          const catData = await catRes.json();
          const movData = await movRes.json();
          setCategories(catData.categories || []);
          setMovies(movData.movies || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update query when URL params change
  useEffect(() => {
    const q = searchParams.get('q');
    const cat = searchParams.get('category');
    if (q !== null) setQuery(q);
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);

  // Client-side filtering & sorting
  const filteredMovies = movies.filter((movie: any) => {
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      movie.title.toLowerCase().includes(q) ||
      (movie.titleRw && movie.titleRw.toLowerCase().includes(q)) ||
      (movie.synopsis && movie.synopsis.toLowerCase().includes(q));

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === 'ALL' ||
      movie.categories?.some((c: any) => c.slug === selectedCategory);

    const matchesLanguage =
      selectedLanguage === 'ALL' ||
      (selectedLanguage === 'RW' && movie.hasKinyarwanda) ||
      (selectedLanguage === 'EN' && !movie.hasKinyarwanda);

    const matchesYear =
      selectedYear === 'ALL' || movie.releaseYear.toString() === selectedYear;

    return matchesQuery && matchesCategory && matchesLanguage && matchesYear;
  });

  const sortedMovies = [...filteredMovies].sort((a: any, b: any) => {
    if (sortBy === 'POPULAR') return (b.viewsCount || 0) - (a.viewsCount || 0);
    if (sortBy === 'NEWEST') return b.releaseYear - a.releaseYear;
    if (sortBy === 'DURATION') return b.durationMinutes - a.durationMinutes;
    return 0;
  });

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-text tracking-tight">
            {language === 'rw' ? 'Shakisha no Guhitamo Filime' : 'Browse & Discover Cinema'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted mt-1">
            {language === 'rw'
              ? 'Filime zose zirebwa ku buntu, zifite amahitamo yo kureba mu Kinyarwanda.'
              : 'Explore legally licensed Rwandan features, comedies, documentaries, and drama.'}
          </p>
        </div>

        {/* Big Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-brand-text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-brand-surface border border-brand-border text-brand-text placeholder-brand-text-muted/60 text-sm focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber shadow-soft"
          />
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="space-y-4 bg-brand-surface/60 border border-brand-border/60 rounded-3xl p-5 shadow-card">
        {/* Category Chips */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-2">
            {t('categories')}
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !selectedCategory || selectedCategory === 'ALL'
                  ? 'bg-brand-amber text-[#1B1F3B] shadow-amber'
                  : 'bg-brand-surface text-brand-text-muted hover:text-brand-text border border-brand-border'
              }`}
            >
              {t('allGenres')}
            </button>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-brand-amber text-[#1B1F3B] shadow-amber'
                      : 'bg-brand-surface text-brand-text-muted hover:text-brand-text border border-brand-border'
                  }`}
                >
                  {language === 'rw' ? cat.nameRw : cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language, Year, and Sort dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-brand-border/40">
          {/* Audio Language Filter */}
          <div>
            <label className="block text-xs font-semibold text-brand-text-muted mb-1.5 flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-brand-amber" />
              <span>Audio Language</span>
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
            >
              <option value="ALL">All Audio Languages</option>
              <option value="RW">Ikinyarwanda Version Available</option>
              <option value="EN">English Audio Only</option>
            </select>
          </div>

          {/* Release Year Filter */}
          <div>
            <label className="block text-xs font-semibold text-brand-text-muted mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand-amber" />
              <span>{t('year')}</span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
            >
              <option value="ALL">All Years</option>
              <option value="2025">2025 Releases</option>
              <option value="2024">2024 Releases</option>
              <option value="2023">2023 Releases</option>
              <option value="2022">2022 & Earlier</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div>
            <label className="block text-xs font-semibold text-brand-text-muted mb-1.5 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-amber" />
              <span>{t('sortBy')}</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
            >
              <option value="POPULAR">{t('mostViewed')}</option>
              <option value="NEWEST">{t('newest')}</option>
              <option value="DURATION">Duration (Shortest to Longest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-brand-text-muted px-1">
        <span>
          Showing <strong>{sortedMovies.length}</strong> licensed movies
        </span>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="p-16 text-center text-brand-text-muted flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
          <p className="text-sm">Filtering film catalog...</p>
        </div>
      ) : sortedMovies.length === 0 ? (
        <div className="p-16 text-center bg-brand-surface border border-brand-border rounded-3xl text-brand-text-muted">
          <Film className="w-12 h-12 mx-auto text-brand-text-muted/40 mb-3" />
          <p className="font-bold text-brand-text">{t('noMoviesFound')}</p>
          <p className="text-xs mt-1">Try clearing filters or searching for another keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {sortedMovies.map((movie) => (
            <div key={movie.id} className="w-full flex justify-center">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text transition-colors duration-200">
      <PublicHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Suspense fallback={
          <div className="p-16 text-center text-brand-text-muted flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-sm">Loading search...</p>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}

