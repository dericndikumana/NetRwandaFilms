'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Clock, Loader2, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface ReportRecord {
  id: string;
  movieId: string;
  reporterName: string;
  reporterEmail: string;
  rightsOwnerProof: string;
  description: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  adminNotes?: string | null;
  createdAt: string;
  movie: {
    id: string;
    title: string;
    slug: string;
    licenseOwner: string;
    licenseStatus: string;
    licenseExpires: string;
  };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [status, setStatus] = useState<string>('PENDING');
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openReviewModal = (r: ReportRecord) => {
    setSelectedReport(r);
    setStatus(r.status);
    setAdminNotes(r.adminNotes || '');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          status,
          adminNotes,
        }),
      });

      if (res.ok) {
        setSelectedReport(null);
        await fetchReports();
      } else {
        alert('Failed to update report status.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-brand-coral" /> DMCA & Copyright Claims Center
        </h2>
        <p className="text-sm text-brand-text-muted mt-1">
          Review notices from copyright owners, examine proof of rights, and resolve claims.
        </p>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-brand-text-muted flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-sm">Auditing copyright claims...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-brand-text-muted">
            <ShieldCheck className="w-12 h-12 mx-auto text-brand-green/60 mb-3" />
            <p className="font-semibold text-brand-text">All Clear: 0 Infringement Claims</p>
            <p className="text-xs mt-1">All catalog titles are operating within verified licenses.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-muted text-xs uppercase tracking-wider bg-brand-bg/40">
                  <th className="py-4 px-6 font-semibold">Claimant</th>
                  <th className="py-4 px-6 font-semibold">Challenged Film</th>
                  <th className="py-4 px-6 font-semibold">License On Record</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Filed Date</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-brand-surface-hover/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-brand-text">{report.reporterName}</div>
                      <div className="text-xs text-brand-text-muted">{report.reporterEmail}</div>
                    </td>
                    <td className="py-4 px-6">
                      <Link
                        href={`/movie/${report.movie.slug}`}
                        target="_blank"
                        className="font-semibold text-brand-text hover:text-brand-amber transition-colors flex items-center gap-1"
                      >
                        <span>{report.movie.title}</span>
                        <ExternalLink className="w-3 h-3 text-brand-text-muted" />
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-xs text-brand-text-muted">
                      <div>Owner: {report.movie.licenseOwner}</div>
                      <div>Expiry: {formatDate(report.movie.licenseExpires)}</div>
                    </td>
                    <td className="py-4 px-4">
                      {report.status === 'PENDING' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-coral/20 text-brand-coral border border-brand-coral/40">
                          Pending Review
                        </span>
                      ) : report.status === 'IN_REVIEW' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-amber/20 text-brand-amber border border-brand-amber/40">
                          In Investigation
                        </span>
                      ) : report.status === 'RESOLVED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-green/20 text-brand-green border border-brand-green/40">
                          Resolved
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-bg text-brand-text-muted border border-brand-border">
                          Dismissed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-brand-text-muted">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openReviewModal(report)}
                        className="px-3 py-1.5 rounded-xl bg-brand-amber hover:bg-brand-amber/90 text-[#1B1F3B] text-xs font-bold transition-all cursor-pointer"
                      >
                        Examine Claim
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1F3B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <div>
                <h3 className="text-lg font-bold text-brand-text">Examine Copyright Claim</h3>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Challenging "{selectedReport.movie.title}"
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 text-brand-text-muted hover:text-brand-text rounded-lg hover:bg-brand-surface-hover"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4 mt-6">
              <div className="p-4 rounded-2xl bg-brand-bg/50 border border-brand-border space-y-2 text-xs">
                <div>
                  <span className="text-brand-text-muted">Reporter Name:</span>{' '}
                  <strong className="text-brand-text">{selectedReport.reporterName}</strong>
                </div>
                <div>
                  <span className="text-brand-text-muted">Reporter Email:</span>{' '}
                  <a
                    href={`mailto:${selectedReport.reporterEmail}`}
                    className="text-brand-blue hover:underline"
                  >
                    {selectedReport.reporterEmail}
                  </a>
                </div>
                <div>
                  <span className="text-brand-text-muted">Ownership Proof / Basis:</span>
                  <p className="text-brand-text mt-1 p-2 rounded-xl bg-brand-surface border border-brand-border">
                    {selectedReport.rightsOwnerProof}
                  </p>
                </div>
                <div>
                  <span className="text-brand-text-muted">Claim Details:</span>
                  <p className="text-brand-text mt-1 p-2 rounded-xl bg-brand-surface border border-brand-border">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Update Resolution Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                >
                  <option value="PENDING">PENDING - Unaudited</option>
                  <option value="IN_REVIEW">IN_REVIEW - Contacting Studio</option>
                  <option value="RESOLVED">RESOLVED - License Verified or Film Taken Down</option>
                  <option value="DISMISSED">DISMISSED - Unfounded Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Internal Administrative Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record outcome of conversation with licensor or actions taken..."
                  className="w-full px-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-hover"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-bold text-xs shadow-amber flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Resolution</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

