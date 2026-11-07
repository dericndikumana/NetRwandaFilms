'use client';

import React, { useState } from 'react';
import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { Mail, Phone, MapPin, Send, CheckCircle2, Film } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Licensing & Film Submission');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSent(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text transition-colors duration-200">
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        <div className="space-y-2 border-b border-brand-border/60 pb-6 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text tracking-tight">
            Contact & Filmmaker Submissions
          </h1>
          <p className="text-xs sm:text-sm text-brand-text-muted">
            Connect with NetRwandaFilms staff for licensing, creator partnerships, and viewer support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-brand-amber uppercase tracking-wider">
                Direct Inquiries
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-brand-text-muted block">General Support:</span>
                    <a href="mailto:support@netrwandafilms.rw" className="text-brand-text font-bold hover:text-brand-amber">
                      support@netrwandafilms.rw
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Film className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-brand-text-muted block">Filmmaker Licensing:</span>
                    <a href="mailto:licensing@netrwandafilms.rw" className="text-brand-text font-bold hover:text-brand-green">
                      licensing@netrwandafilms.rw
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-brand-text-muted block">Location:</span>
                    <span className="text-brand-text font-bold">Kigali Innovation Hub, Gasabo, Rwanda</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filmmaker Callout Card */}
            <div className="bg-gradient-to-br from-brand-amber/15 to-brand-surface border border-brand-amber/40 rounded-3xl p-6 shadow-card space-y-2">
              <span className="text-[10px] font-black uppercase text-brand-amber tracking-wider">
                Are you a filmmaker?
              </span>
              <h4 className="text-sm font-bold text-brand-text">
                Distribute your cinema for free across East Africa
              </h4>
              <p className="text-xs text-brand-text-muted leading-relaxed">
                Reach thousands of mobile viewers in Rwanda while receiving tips via MTN MoMo and audience exposure.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2 bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-card">
            {sent ? (
              <div className="py-12 text-center space-y-3 text-brand-green">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
                <h3 className="text-lg font-bold">Message Sent!</h3>
                <p className="text-xs text-brand-text-muted">
                  Thank you for reaching out. Our team in Kigali will reply within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jean-Paul Gasana"
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@domain.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                    Subject / Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                  >
                    <option value="Licensing & Film Submission">Filmmaker Submission / Film Licensing</option>
                    <option value="Streaming Technical Support">Streaming Issue / Video Playback</option>
                    <option value="Copyright & Legal Inquiry">Copyright / Rights Verification</option>
                    <option value="Donation & Creator Fund">Donations / Mobile Money Support</option>
                    <option value="General Question">General Feedback & Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your film, project, or question..."
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-bold text-sm shadow-amber flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Team</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

