'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Film, Search, Globe, Bookmark, Menu, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';
import { ThemeToggle } from '@/components/theme-toggle';

export function PublicHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: t('home'), href: '/' },
    { name: t('rwandanCinema'), href: '/search?category=rwandan-cinema' },
    { name: t('categories'), href: '/search' },
    { name: t('favorites'), href: '/favorites' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border/60 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-brand-amber/20 border border-brand-amber/40 flex items-center justify-center text-brand-amber shadow-amber group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-brand-text leading-none">
              NetRwanda<span className="text-brand-amber">Films</span>
            </span>
            <span className="text-[10px] text-brand-green font-semibold uppercase tracking-wider mt-0.5">
              100% Free & Licensed
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'text-brand-amber bg-brand-surface'
                    : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar (Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden sm:flex items-center relative flex-1 max-w-xs lg:max-w-sm"
        >
          <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-brand-surface border border-brand-border text-brand-text placeholder-brand-text-muted/60 text-xs focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-all"
          />
        </form>

        {/* Right Tools: Language Selector, Theme Toggle, Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switch Button */}
          <div className="flex items-center bg-brand-surface border border-brand-border rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                language === 'en'
                  ? 'bg-brand-amber text-[#1B1F3B] shadow-sm'
                  : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('rw')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                language === 'rw'
                  ? 'bg-brand-amber text-[#1B1F3B] shadow-sm'
                  : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              RW
            </button>
          </div>

          <ThemeToggle />

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl bg-brand-surface text-brand-text-muted hover:text-brand-text border border-brand-border"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-brand-surface/95 backdrop-blur-md px-4 py-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-brand-bg border border-brand-border text-brand-text placeholder-brand-text-muted/60 text-sm focus:outline-none focus:border-brand-amber"
            />
          </form>

          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-2xl text-sm font-semibold text-brand-text hover:bg-brand-surface-hover transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs text-brand-green font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Rwandan Licensed Content</span>
            </div>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-brand-text-muted hover:text-brand-amber"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

