import React from 'react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

export default function DmcaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="space-y-2 border-b border-brand-border/60 pb-6">
          <div className="flex items-center gap-2 text-brand-coral font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Intellectual Property Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
            Copyright & DMCA Policy
          </h1>
          <p className="text-xs text-brand-text-muted">
            NetRwandaFilms respects the intellectual property rights of filmmakers, studios, and creators.
          </p>
        </div>

        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-10 shadow-card space-y-6 text-sm text-brand-text-muted leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">1. Strict Rights Policy</h2>
            <p>
              NetRwandaFilms operates strictly under licensed and authorized distribution. We do not knowingly host or stream unauthorized media. Every title on our platform is tied to a verified licensing record with the licensor's credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">2. Filing an Infringement Notice</h2>
            <p>
              If you believe your copyrighted work is accessible on NetRwandaFilms without valid written authorization or license agreement, please send a written notification containing:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>Identification of the material that is claimed to be infringing (including the movie page URL).</li>
              <li>Your contact details: legal name, telephone number, and official email address.</li>
              <li>A statement that you have a good faith belief that the use is not authorized by the copyright owner.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">3. Designated Copyright Agent</h2>
            <div className="p-4 rounded-2xl bg-brand-bg/70 border border-brand-border text-xs space-y-1">
              <p className="font-bold text-brand-text">Legal Compliance Office — NetRwandaFilms</p>
              <p>Email: legal@netrwandafilms.rw</p>
              <p>Address: Kigali Creative Hub, Gasabo, Kigali, Rwanda</p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-brand-text">4. Immediate Takedown Action</h2>
            <p>
              Upon receipt of a valid notice, NetRwandaFilms will immediately investigate and, if justified, suspend public streaming of the identified title while verifying documentation with the licensor.
            </p>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

