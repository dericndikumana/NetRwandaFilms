'use client';

import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  nameRw: string;
  slug: string;
  description?: string | null;
  displayOrder: number;
  _count?: {
    movies: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [nameRw, setNameRw] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setNameRw('');
    setDescription('');
    setDisplayOrder((categories.length + 1).toString());
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setNameRw(cat.nameRw);
    setDescription(cat.description || '');
    setDisplayOrder(cat.displayOrder.toString());
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nameRw,
          description,
          displayOrder: parseInt(displayOrder, 10),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save category.');
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${catId}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== catId));
      } else {
        alert('Super Admin privileges required to delete category.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-text tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-brand-amber" /> Category & Genre Curator
          </h2>
          <p className="text-sm text-brand-text-muted mt-1">
            Organize films into bilingual horizontal rows on the public homepage.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-amber hover:bg-brand-amber/90 active:scale-95 text-[#1B1F3B] font-semibold text-sm shadow-amber transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-card">
        {loading ? (
          <div className="p-12 text-center text-brand-text-muted flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-brand-amber animate-spin" />
            <p className="text-sm">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-brand-text-muted">
            <p className="font-semibold text-brand-text">No categories configured yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-muted text-xs uppercase tracking-wider bg-brand-bg/40">
                  <th className="py-4 px-6 font-semibold">Order</th>
                  <th className="py-4 px-6 font-semibold">English Name</th>
                  <th className="py-4 px-6 font-semibold">Kinyarwanda Name</th>
                  <th className="py-4 px-4 font-semibold">Slug</th>
                  <th className="py-4 px-4 font-semibold">Movies Linked</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-brand-surface-hover/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-amber text-xs">
                      #{cat.displayOrder}
                    </td>
                    <td className="py-4 px-6 font-semibold text-brand-text">
                      {cat.name}
                    </td>
                    <td className="py-4 px-6 font-medium text-brand-green">
                      {cat.nameRw}
                    </td>
                    <td className="py-4 px-4 text-xs text-brand-text-muted">
                      {cat.slug}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-brand-text">
                      <span className="px-2.5 py-1 rounded-full bg-brand-bg border border-brand-border">
                        {cat._count?.movies || 0} movies
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 text-brand-text-muted hover:text-brand-amber transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 text-brand-text-muted hover:text-brand-coral transition-colors"
                        title="Delete Category"
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

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1B1F3B]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-brand-surface border border-brand-border rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-soft">
            <div className="flex items-center justify-between pb-4 border-b border-brand-border">
              <h3 className="text-lg font-bold text-brand-text">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-brand-text-muted hover:text-brand-text rounded-lg hover:bg-brand-surface-hover"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-brand-coral/15 border border-brand-coral/30 text-brand-coral text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Category Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rwandan Cinema"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Category Name (Kinyarwanda) *
                </label>
                <input
                  type="text"
                  required
                  value={nameRw}
                  onChange={(e) => setNameRw(e.target.value)}
                  placeholder="e.g. Filime Nyarwanda"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Homepage Row Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-sm focus:outline-none focus:border-brand-amber"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text-muted mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis of what films fit in this genre..."
                  className="w-full px-4 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text text-xs focus:outline-none focus:border-brand-amber"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-hover"
                >
                  Cancel
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
                    <span>Save Category</span>
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

