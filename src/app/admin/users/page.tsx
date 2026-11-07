'use client';

import React, { useEffect, useState } from 'react';
import { Users, Shield, Trash2, Loader2, Check } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserRecord {
  id: string;
  name?: string | null;
  email: string;
  role: 'SUPER_ADMIN' | 'EDITOR' | 'USER';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)));
      } else {
        alert('Failed to change role.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove user "${email}"?`)) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-amber" /> User Accounts & Staff Roles
        </h2>
        <p className="text-sm text-brand-text-muted mt-1">
          Super Admin authorization controls. Delegate film editing permissions or manage accounts.
        </p>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-brand-text-muted flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-sm">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-muted text-xs uppercase tracking-wider bg-brand-bg/40">
                  <th className="py-4 px-6 font-semibold">User Identity</th>
                  <th className="py-4 px-6 font-semibold">Email</th>
                  <th className="py-4 px-4 font-semibold">System Role</th>
                  <th className="py-4 px-4 font-semibold">Created Date</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-surface-hover/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-text">
                      {user.name || 'Anonymous User'}
                    </td>
                    <td className="py-4 px-6 text-xs text-brand-text-muted">
                      {user.email}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-brand-amber/20 text-brand-amber border-brand-amber/40'
                            : user.role === 'EDITOR'
                            ? 'bg-brand-green/20 text-brand-green border-brand-green/40'
                            : 'bg-brand-bg text-brand-text border-brand-border'
                        }`}
                      >
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="USER">USER (Consumer)</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-xs text-brand-text-muted">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="p-2 text-brand-text-muted hover:text-brand-coral transition-colors"
                        title="Delete User"
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

