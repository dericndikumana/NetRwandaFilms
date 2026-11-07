import React from 'react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { ShieldCheck, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="space-y-2 border-b border-brand-border/60 pb-6">
          <div className="flex items-center gap-2 text-brand-green font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal Policy & Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-brand-text-muted">
            Last updated: November 2025 • Governed under the laws of the Republic of Rwanda
          </p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-10 shadow-card space-y-6 text-sm text-brand-text-muted leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">1. Free Streaming Agreement</h2>
            <p>
              NetRwandaFilms is a public digital streaming platform providing free access to licensed cinematic works for personal, non-commercial entertainment. Access does not require credit card registration or subscription payments.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">2. Intellectual Property & Licensing</h2>
            <p>
              All films, motion pictures, documentaries, promotional trailers, audio dubbing tracks, and artwork available on NetRwandaFilms are streamed under written authorization, broadcast license, or direct distribution agreements with copyright holders and Rwandan filmmakers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">3. Automatic Expiration Policy</h2>
            <p>
              In accordance with our rights management commitment, any movie whose license agreement term concludes is automatically removed and hidden from public streaming without exception.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">4. Prohibited Uses</h2>
            <p>
              Users are strictly prohibited from copying, ripping, redistributing, or re-broadcasting audio or video files streamed from our Cloudflare R2 edge network.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">5. Contact Information</h2>
            <p>
              For licensing inquiries, submissions, or regulatory verification, reach out to legal@netrwandafilms.rw or visit our Contact page.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

