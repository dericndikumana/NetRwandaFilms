'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, Loader2, DollarSign } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-brand-text-muted">
        <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
        <p className="text-sm">Loading platform settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-amber" /> Platform Branding & Site Text
        </h2>
        <p className="text-sm text-brand-text-muted mt-1">
          Customize site name, logo, contact addresses, footer text, and mobile donation channels.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-brand-green/15 border border-brand-green/30 flex items-center gap-3 text-brand-green text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Platform settings updated successfully and applied to public pages.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding & Identities */}
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-brand-amber uppercase tracking-wider">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                Platform Name
              </label>
              <input
                type="text"
                value={settings.site_name || 'NetRwandaFilms'}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                Custom Logo URL (optional)
              </label>
              <input
                type="url"
                value={settings.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://.../logo.png"
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
              />
            </div>
          </div>
        </div>

        {/* Contact & Legal Emails */}
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-brand-amber uppercase tracking-wider">
            Contact & Legal Inquiries
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                General Support & Audience Email
              </label>
              <input
                type="email"
                value={settings.contact_email || 'support@netrwandafilms.rw'}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                DMCA & Copyright Claims Email
              </label>
              <input
                type="email"
                value={settings.dmca_email || 'legal@netrwandafilms.rw'}
                onChange={(e) => handleChange('dmca_email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
              />
            </div>
          </div>
        </div>

        {/* Creator Fund & Donation (MTN MoMo / Airtel Money) */}
        <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-brand-amber uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" /> Support Rwandan Creators & Film Fund
          </h3>

          <div>
            <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
              MTN Mobile Money / Airtel Money USSD Code or Merchant Number
            </label>
            <input
              type="text"
              value={settings.momo_code || '*182*8*1*123456#'}
              onChange={(e) => handleChange('momo_code', e.target.value)}
              placeholder="e.g. *182*8*1*123456# (NetRwanda Creators Fund)"
              className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                Donation Banner Text (English)
              </label>
              <textarea
                rows={2}
                value={settings.donation_message_en || ''}
                onChange={(e) => handleChange('donation_message_en', e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                Donation Banner Text (Kinyarwanda)
              </label>
              <textarea
                rows={2}
                value={settings.donation_message_rw || ''}
                onChange={(e) => handleChange('donation_message_rw', e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-bold text-sm shadow-amber flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Platform Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

