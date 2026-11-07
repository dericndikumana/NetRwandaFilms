'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  Play,
  Share2,
  Heart,
  Clock,
  Film,
  Languages,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Send,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { MovieRow } from '@/components/public/movie-row';
import { formatDuration, formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/language-provider';

export default function MovieDetailsPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language, t } = useLanguage();

  const [movie, setMovie] = useState<any>(null);
  const [relatedMovies, setRelatedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Comments state
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // DMCA Report Form State
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [rightsProof, setRightsProof] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function fetchMovieDetails() {
      try {
        setLoading(true);
        // Fetch movies from API
        const res = await fetch(`/api/movies?search=${encodeURIComponent(slug)}`);
        if (res.ok) {
          const data = await res.json();
          const found = data.movies?.find((m: any) => m.slug === slug);
          if (found) {
            setMovie(found);

            // Fetch comments
            const commRes = await fetch(`/api/comments?movieId=${found.id}`);
            if (commRes.ok) {
              const commData = await commRes.json();
              setComments(commData.comments || []);
            }

            // Fetch related movies
            const firstCat = found.categories?.[0]?.slug;
            if (firstCat) {
              const relRes = await fetch(`/api/movies?category=${firstCat}`);
              if (relRes.ok) {
                const relData = await relRes.json();
                setRelatedMovies(relData.movies?.filter((m: any) => m.id !== found.id) || []);
              }
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchMovieDetails();
  }, [slug]);

  // Check Favorite
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
        // Fallback to copy
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 3000);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          userName: newCommentName || 'Anonymous Viewer',
          content: newCommentContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments([data.comment, ...comments]);
        setNewCommentContent('');
        setCommentSuccess(true);
        setTimeout(() => setCommentSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          reporterName,
          reporterEmail,
          rightsOwnerProof: rightsProof,
          description: claimDescription,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setShowReportModal(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
        <PublicHeader />
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-brand-text-muted">
          <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
          <p className="text-sm">Loading film presentation...</p>
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
          <h2 className="text-xl font-bold">Film Not Found or License Inactive</h2>
          <p className="text-xs text-brand-text-muted max-w-md">
            This title may not exist or its distribution license has expired and been automatically removed from public streaming.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-brand-amber text-[#1B1F3B] font-bold text-xs"
          >
            Back to Homepage
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

      {/* Hero Backdrop Header */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[460px] overflow-hidden bg-brand-surface">
        <img
          src={movie.bannerUrl || movie.posterUrl}
          alt={displayTitle}
          className="w-full h-full object-cover filter blur-sm scale-105 opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent" />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 sm:-mt-48 relative z-10 w-full space-y-12">
        {/* Main Details Presentation Card */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-10 items-start">
          {/* Vertical Poster Card */}
          <div className="w-48 sm:w-64 flex-shrink-0 mx-auto md:mx-0 shadow-soft rounded-3xl overflow-hidden border border-brand-border bg-brand-surface">
            <img
              src={movie.posterUrl}
              alt={displayTitle}
              className="w-full aspect-[2/3] object-cover"
            />
          </div>

          {/* Details & CTA Column */}
          <div className="flex-1 space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-brand-amber text-[#1B1F3B] text-xs font-black uppercase tracking-wider">
                100% Free
              </span>
              {movie.hasKinyarwanda && (
                <span className="px-2.5 py-1 rounded-lg bg-brand-green/90 text-[#1B1F3B] text-xs font-black uppercase tracking-wider flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5" />
                  <span>Kinyarwanda Audio</span>
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-xs font-bold text-brand-text">
                {movie.ageRating}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-brand-text tracking-tight leading-tight">
                {displayTitle}
              </h1>
              {language === 'rw' && movie.title && movie.title !== movie.titleRw && (
                <p className="text-sm text-brand-text-muted mt-1">
                  English Title: <em>{movie.title}</em>
                </p>
              )}
            </div>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-brand-text-muted">
              <span className="flex items-center gap-1 font-bold text-brand-amber">
                <Calendar className="w-4 h-4" />
                {movie.releaseYear}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-4 h-4" />
                {formatDuration(movie.durationMinutes)}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {movie.categories?.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/search?category=${cat.slug}`}
                    className="px-2 py-0.5 rounded-md bg-brand-surface border border-brand-border hover:border-brand-amber/50 text-[11px] font-semibold text-brand-text transition-colors"
                  >
                    {language === 'rw' ? cat.nameRw : cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                {t('synopsis')}
              </h3>
              <p className="text-sm sm:text-base text-brand-text/90 leading-relaxed max-w-3xl">
                {displaySynopsis}
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Watch Now Button */}
              <Link
                href={`/watch/${movie.slug}`}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-extrabold text-base shadow-amber transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-[#1B1F3B]" />
                <span>{t('watchNow')}</span>
              </Link>

              {/* Watch in Kinyarwanda CTA (if available) */}
              {movie.hasKinyarwanda && (
                <Link
                  href={`/watch/${movie.slug}?lang=rw`}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-green hover:bg-brand-green/90 active:scale-95 text-[#1B1F3B] font-extrabold text-sm shadow-green transition-all cursor-pointer"
                >
                  <Languages className="w-4 h-4" />
                  <span>{t('watchInKinyarwanda')}</span>
                </Link>
              )}

              {/* Watch Trailer */}
              {movie.trailerUrl && (
                <button
                  type="button"
                  onClick={() => setShowTrailerModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-brand-surface hover:bg-brand-surface-hover text-brand-text border border-brand-border text-sm font-bold transition-all"
                >
                  <Film className="w-4 h-4 text-brand-amber" />
                  <span>{t('trailer')}</span>
                </button>
              )}

              {/* Add to List */}
              <button
                type="button"
                onClick={toggleFavorite}
                className="p-3.5 rounded-2xl bg-brand-surface hover:bg-brand-surface-hover text-brand-text border border-brand-border transition-all"
                title={isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? 'fill-brand-coral text-brand-coral' : 'text-brand-text'
                  }`}
                />
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                className="p-3.5 rounded-2xl bg-brand-surface hover:bg-brand-surface-hover text-brand-text border border-brand-border transition-all flex items-center gap-1.5"
                title="Share Movie"
              >
                {shareCopied ? (
                  <Check className="w-5 h-5 text-brand-green" />
                ) : (
                  <Share2 className="w-5 h-5" />
                )}
                {shareCopied && <span className="text-xs text-brand-green font-bold">Copied!</span>}
              </button>
            </div>
          </div>
        </div>

        {/* License Transparency Notice Card */}
        {movie.licenseOwner && (
          <div className="p-5 rounded-3xl bg-brand-surface border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-card">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-green/20 text-brand-green flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-brand-text">
                  Legally Authorized for Free Streaming in Rwanda
                </p>
                <p className="text-brand-text-muted mt-0.5">
                  Rights holder: <strong className="text-brand-text">{movie.licenseOwner}</strong>
                  {movie.licenseExpires && (
                    <span> • Valid through: {formatDate(movie.licenseExpires)}</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs text-brand-text-muted hover:text-brand-coral transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Inquire / DMCA Notice</span>
            </button>
          </div>
        )}

        {/* Audience Comments Section */}
        <section className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-amber" />
              <h3 className="text-lg font-bold text-brand-text">{t('comments')}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-bg text-brand-text-muted">
                {comments.length}
              </span>
            </div>
          </div>

          {commentSuccess && (
            <div className="p-3.5 rounded-xl bg-brand-green/15 border border-brand-green/30 text-brand-green text-xs font-semibold">
              Thank you! Your comment was posted successfully.
            </div>
          )}

          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder={t('guestName')}
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-text-muted/60 text-xs focus:outline-none focus:border-brand-amber"
              />
              <div className="sm:col-span-2 relative">
                <input
                  type="text"
                  required
                  placeholder={t('leaveComment')}
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-text-muted/60 text-xs focus:outline-none focus:border-brand-amber"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newCommentContent.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-brand-amber hover:bg-brand-amber/90 text-[#1B1F3B] font-bold text-xs flex items-center gap-1 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3 pt-4 border-t border-brand-border/60">
            {comments.length === 0 ? (
              <p className="text-xs text-brand-text-muted text-center py-4">
                Be the first to leave a comment on this Rwandan presentation!
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-brand-bg/60 border border-brand-border/40 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-text">{c.userName}</span>
                    <span className="text-[10px] text-brand-text-muted">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-brand-text-muted leading-relaxed">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* More Like This / Related Movies Row */}
        {relatedMovies.length > 0 && (
          <MovieRow
            title="More Like This"
            titleRw="Izindi zisa n'iyi"
            movies={relatedMovies}
          />
        )}
      </main>

      {/* Trailer Modal */}
      {showTrailerModal && movie.trailerUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1F3B]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-3xl overflow-hidden shadow-soft">
            <div className="flex items-center justify-between p-4 border-b border-brand-border">
              <h4 className="text-sm font-bold text-brand-text">
                {movie.title} — Official Teaser Trailer
              </h4>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="p-1.5 rounded-lg text-brand-text-muted hover:text-brand-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-brand-bg">
              <video
                src={movie.trailerUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* DMCA / Copyright Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1F3B]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <h4 className="text-base font-bold text-brand-text">
                  Copyright / DMCA Takedown Notice
                </h4>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Filing inquiry for "{movie.title}"
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg text-brand-text-muted hover:text-brand-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-2 text-brand-green">
                <Check className="w-10 h-10 mx-auto" />
                <p className="font-bold text-sm">Notice Received</p>
                <p className="text-xs text-brand-text-muted">
                  Our legal compliance team will audit the license on record and contact you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4 mt-6 text-xs">
                <div>
                  <label className="block font-semibold text-brand-text-muted mb-1">
                    Your Full Name / Entity *
                  </label>
                  <input
                    type="text"
                    required
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-text-muted mb-1">
                    Official Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-text-muted mb-1">
                    Proof of Ownership / Authorization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Registered copyright registration # or studio authorization"
                    value={rightsProof}
                    onChange={(e) => setRightsProof(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-text-muted mb-1">
                    Description of Infringement Claim *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={claimDescription}
                    onChange={(e) => setClaimDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-xl text-brand-text-muted hover:text-brand-text"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-5 py-2.5 rounded-xl bg-brand-coral hover:bg-brand-coral/90 text-[#1B1F3B] font-bold shadow-soft cursor-pointer"
                  >
                    {submittingReport ? 'Filing Notice...' : 'Submit Legal Notice'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}

