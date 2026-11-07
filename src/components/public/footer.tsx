'use client';

import React from 'react';
import Link from 'next/link';
import { Film, ShieldCheck, Heart, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-surface border-t border-brand-border mt-20 transition-colors duration-200">
      {/* Top Banner: Support Rwandan Filmmakers via MoMo */}
      <div className="bg-gradient-to-r from-brand-amber/15 via-brand-surface to-brand-green/15 border-b border-brand-border py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-amber/20 border border-brand-amber/40 flex items-center justify-center text-brand-amber flex-shrink-0">
              <Heart className="w-5 h-5 fill-brand-amber" />
            </div>
            <div>
              <p className="text-sm font-bold text-brand-text">
                Support Rwandan Cinema & Creative Talents
              </p>
              <p className="text-xs text-brand-text-muted">
                100% free streaming. Keep local filmmaking alive by tipping creators via MTN Mobile Money.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-brand-bg/80 border border-brand-amber/40 text-xs font-mono font-bold text-brand-amber shadow-amber">
            MTN MoMo: *182*8*1*123456#
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-amber/20 border border-brand-amber/40 flex items-center justify-center text-brand-amber">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-brand-text">
                NetRwanda<span className="text-brand-amber">Films</span>
              </span>
            </Link>
            <p className="text-xs text-brand-text-muted max-w-sm leading-relaxed">
              {t('legalNotice')}
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-green font-medium pt-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{t('freeAndLegal')}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-brand-text-muted hover:text-brand-amber transition-colors">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/search?category=rwandan-cinema" className="text-brand-text-muted hover:text-brand-amber transition-colors">
                  {t('rwandanCinema')}
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-brand-text-muted hover:text-brand-amber transition-colors">
                  {t('categories')}
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-brand-text-muted hover:text-brand-amber transition-colors">
                  {t('favorites')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text">
              Legal & Rights
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dmca" className="text-brand-text-muted hover:text-brand-amber transition-colors">
                  {t('copyrightDmca')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-brand-text-muted hover:text-brand-amber transition-colors">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-brand-text-muted hover:text-brand-amber transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-brand-text-muted hover:text-brand-amber transition-colors">
                  {t('adminLogin')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="pt-8 mt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-text-muted">
          <p>© {new Date().getFullYear()} NetRwandaFilms. All rights reserved. Kigali, Rwanda.</p>
          <p className="text-[11px]">
            Designed for high performance on Rwandan mobile networks & average connectivity.
          </p>
        </div>
      </div>
    </footer>
  );
}

