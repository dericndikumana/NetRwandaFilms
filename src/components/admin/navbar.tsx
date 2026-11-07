'use client';

import React from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Menu, LogOut, UserCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavbarProps {
  onMenuClick: () => void;
}

export function AdminNavbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();

  return (
    <header className="h-20 bg-brand-surface border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-brand-text-muted hover:text-brand-text rounded-xl hover:bg-brand-surface-hover"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-base font-bold text-brand-text hidden sm:block">
            Management Portal
          </h1>
          <p className="text-xs text-brand-text-muted hidden sm:block">
            Legally Licensed Rwandan & Global Cinema
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <ThemeToggle />

        {/* User Pill */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-brand-bg/60 border border-brand-border">
          <UserCircle className="w-6 h-6 text-brand-amber flex-shrink-0" />
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-brand-text leading-tight">
              {session?.user?.name || 'Administrator'}
            </p>
            <p className="text-[10px] text-brand-green font-medium leading-tight">
              {session?.user?.role || 'Staff'}
            </p>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium text-brand-coral hover:bg-brand-coral/10 border border-brand-coral/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Sign out of Admin Dashboard"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

