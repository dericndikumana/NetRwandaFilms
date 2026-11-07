'use client';

import React from 'react';
import { Heart, Sparkles, Smartphone, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/language-provider';

export function DonationCallout() {
  const { language } = useLanguage();

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand-surface via-brand-surface to-[#2F3563] border border-brand-amber/30 p-6 sm:p-8 shadow-card my-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-amber/20 border border-brand-amber/40 flex items-center justify-center text-brand-amber flex-shrink-0 shadow-amber">
            <Heart className="w-6 h-6 fill-brand-amber" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-amber">
                {language === 'rw' ? 'Inkunga y\'Abahanzi' : 'Rwanda Filmmakers Fund'}
              </span>
              <span className="px-2 py-0.2 rounded-full bg-brand-green/20 text-brand-green text-[10px] font-bold">
                100% Free Streaming
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-brand-text">
              {language === 'rw'
                ? 'Komeza gushyigikira umuryango mugari wa filime mu Rwanda'
                : 'Help support free cinema and empower local Rwandan creators'}
            </h3>
            <p className="text-xs sm:text-sm text-brand-text-muted max-w-xl">
              {language === 'rw'
                ? 'NetRwandaFilms yishimira kugeza filime ku banyarwanda ku buntu. Urashobora gutera inkunga umuhanzi unyuze kuri Mobile Money.'
                : 'NetRwandaFilms delivers 100% legal cinema for free. You can donate directly to our creative fund via MTN MoMo or Airtel Money.'}
            </p>
          </div>
        </div>

        {/* USSD Code Callout */}
        <div className="flex flex-col items-center sm:items-end flex-shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-bg border border-brand-amber/40 shadow-soft">
            <Smartphone className="w-5 h-5 text-brand-amber" />
            <div>
              <p className="text-[10px] uppercase font-bold text-brand-text-muted">
                MTN MoMo / Airtel USSD
              </p>
              <p className="text-sm font-mono font-black text-brand-amber tracking-wider">
                *182*8*1*123456#
              </p>
            </div>
          </div>
          <span className="text-[10px] text-brand-green font-medium mt-1.5 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> NetRwanda Creators Collective
          </span>
        </div>
      </div>
    </div>
  );
}

