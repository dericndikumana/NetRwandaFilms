import React from 'react';
import { prisma } from '@/lib/prisma';
import { getActiveLicenseFilter } from '@/lib/license';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { HeroBanner, BannerData } from '@/components/public/hero-banner';
import { ContinueWatchingRow } from '@/components/public/continue-watching-row';
import { MovieRow } from '@/components/public/movie-row';
import { DonationCallout } from '@/components/public/donation-callout';

export const revalidate = 60; // ISR cache revalidation every 60 seconds

export default async function HomePage() {
  const activeLicenseWhere = getActiveLicenseFilter();

  // 1. Fetch Featured Hero Banners (filtering only active movies)
  const bannersRaw = await prisma.featuredBanner.findMany({
    where: {
      isActive: true,
      movie: activeLicenseWhere,
    },
    include: {
      movie: {
        select: {
          id: true,
          title: true,
          titleRw: true,
          slug: true,
          synopsis: true,
          synopsisRw: true,
          bannerUrl: true,
          posterUrl: true,
          durationMinutes: true,
          releaseYear: true,
          ageRating: true,
          hasKinyarwanda: true,
        },
      },
    },
    orderBy: { order: 'asc' },
    take: 6,
  });

  // 2. Fetch Categories with their active licensed movies
  const categoriesRaw = await prisma.category.findMany({
    include: {
      movies: {
        where: activeLicenseWhere,
        select: {
          id: true,
          title: true,
          titleRw: true,
          slug: true,
          posterUrl: true,
          releaseYear: true,
          durationMinutes: true,
          ageRating: true,
          hasKinyarwanda: true,
          viewsCount: true,
        },
        orderBy: { viewsCount: 'desc' },
        take: 12,
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  // 3. Fetch Top Trending / Most Streamed Rwandan & International Films
  const trendingMovies = await prisma.movie.findMany({
    where: activeLicenseWhere,
    select: {
      id: true,
      title: true,
      titleRw: true,
      slug: true,
      posterUrl: true,
      releaseYear: true,
      durationMinutes: true,
      ageRating: true,
      hasKinyarwanda: true,
      viewsCount: true,
    },
    orderBy: { viewsCount: 'desc' },
    take: 12,
  });

  // Fallback banner if no custom banner exists: create one from first trending movie
  const banners: BannerData[] =
    bannersRaw.length > 0
      ? (bannersRaw as any)
      : trendingMovies[0]
      ? [
          {
            id: 'fallback',
            title: trendingMovies[0].title,
            titleRw: trendingMovies[0].titleRw,
            tagline: 'Stream Free • Dual Audio',
            taglineRw: 'Reba ku buntu • Ikinyarwanda',
            movie: {
              ...trendingMovies[0],
              synopsis: 'Stream the finest Rwandan and global cinema directly on your device.',
              synopsisRw: 'Ihere ijisho filime nziza zikunzwe mu Rwanda.',
              bannerUrl: trendingMovies[0].posterUrl,
            },
          },
        ]
      : [];

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-10 sm:space-y-12">
        {/* MovieBox-Style Big Hero Banner Carousel */}
        {banners.length > 0 && <HeroBanner banners={banners} />}

        {/* User Resume / Continue Watching Row */}
        <ContinueWatchingRow />

        {/* Most Popular / Trending Row */}
        {trendingMovies.length > 0 && (
          <MovieRow
            title="Most Popular in Rwanda"
            titleRw="Izikunzwe Cyane mu Rwanda"
            slug="trending"
            movies={trendingMovies}
          />
        )}

        {/* Dynamic Category Rows (Rwandan Cinema, Action, Drama, Comedy, Documentary) */}
        {categoriesRaw.map((category) => {
          if (category.movies.length === 0) return null;
          return (
            <MovieRow
              key={category.id}
              title={category.name}
              titleRw={category.nameRw}
              slug={category.slug}
              movies={category.movies}
            />
          );
        })}

        {/* Rwandan Filmmakers MoMo Donation Callout */}
        <DonationCallout />
      </main>

      <PublicFooter />
    </div>
  );
}

