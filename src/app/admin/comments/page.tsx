'use client';

import React, { useEffect, useState } from 'react';
import { MessageSquare, Check, X, Trash2, Loader2, Film } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface CommentRecord {
  id: string;
  movieId: string;
  userName: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  movie: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const toggleApproval = async (commentId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, isApproved: !currentStatus }),
      });

      if (res.ok) {
        setComments(
          comments.map((c) => (c.id === commentId ? { ...c, isApproved: !currentStatus } : c))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Permanently delete this comment?')) return;

    try {
      const res = await fetch(`/api/admin/comments?commentId=${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-amber" /> Audience Comments Moderation
        </h2>
        <p className="text-sm text-brand-text-muted mt-1">
          Review community feedback and ensure positive, safe discussion for Rwandan moviegoers.
        </p>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-brand-text-muted flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-sm">Loading audience comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center text-brand-text-muted">
            <p className="font-semibold text-brand-text">No comments to moderate</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-muted text-xs uppercase tracking-wider bg-brand-bg/40">
                  <th className="py-4 px-6 font-semibold">Viewer</th>
                  <th className="py-4 px-6 font-semibold">Film</th>
                  <th className="py-4 px-8 font-semibold">Comment Content</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-brand-surface-hover/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-text">
                      {comment.userName}
                    </td>
                    <td className="py-4 px-6 text-xs text-brand-amber">
                      <Link
                        href={`/movie/${comment.movie.slug}`}
                        target="_blank"
                        className="hover:underline flex items-center gap-1"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>{comment.movie.title}</span>
                      </Link>
                    </td>
                    <td className="py-4 px-8 text-xs text-brand-text max-w-md">
                      <p className="line-clamp-2">{comment.content}</p>
                    </td>
                    <td className="py-4 px-4">
                      {comment.isApproved ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-green/20 text-brand-green border border-brand-green/40">
                          Approved
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-coral/20 text-brand-coral border border-brand-coral/40">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs text-brand-text-muted">
                      {formatDate(comment.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => toggleApproval(comment.id, comment.isApproved)}
                        className={`p-2 rounded-xl transition-colors ${
                          comment.isApproved
                            ? 'text-brand-text-muted hover:text-brand-coral'
                            : 'text-brand-green hover:bg-brand-green/10'
                        }`}
                        title={comment.isApproved ? 'Unapprove' : 'Approve'}
                      >
                        {comment.isApproved ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-2 text-brand-text-muted hover:text-brand-coral transition-colors"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

