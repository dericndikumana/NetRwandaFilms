'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Film,
  FileCheck2,
  FolderTree,
  Sparkles,
  Users,
  MessageSquare,
  AlertTriangle,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export function AdminSidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Movies & Media', href: '/admin/movies', icon: Film },
    { name: 'License Rights', href: '/admin/licenses', icon: FileCheck2 },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Featured Banners', href: '/admin/banners', icon: Sparkles },
    { name: 'Audience Comments', href: '/admin/comments', icon: MessageSquare },
    { name: 'DMCA Reports', href: '/admin/reports', icon: AlertTriangle },
    ...(userRole === 'SUPER_ADMIN'
      ? [
          { name: 'Users & Roles', href: '/admin/users', icon: Users },
          { name: 'Platform Settings', href: '/admin/settings', icon: Settings },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#1B1F3B]/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-brand-surface border-r border-brand-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-brand-border">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-amber/20 border border-brand-amber/40 flex items-center justify-center text-brand-amber shadow-amber">
              <Film className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="text-lg font-bold text-brand-text block leading-tight">
                NetRwanda<span className="text-brand-amber">Admin</span>
              </span>
              <span className="text-[10px] text-brand-green font-semibold uppercase tracking-wider block">
                {userRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Editor Access'}
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-text-muted hover:text-brand-text lg:hidden rounded-lg hover:bg-brand-surface-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-amber text-[#1B1F3B] font-semibold shadow-amber'
                    : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-hover'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive ? 'text-[#1B1F3B]' : 'text-brand-text-muted')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-brand-border space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs font-semibold text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-hover border border-brand-border/60 transition-all"
          >
            <span>View Public Website</span>
            <ExternalLink className="w-4 h-4 text-brand-amber" />
          </Link>
        </div>
      </aside>
    </>
  );
}

