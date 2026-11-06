'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface ToolFormDialogProps {
  toolToEdit?: {
    id: Id<'tools'>;
    name: string;
    category: string;
    condition: string;
    description?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'power tools',
  'garden',
  'kitchen',
  'camping',
  'hand tools',
  'cleaning',
  'other',
] as const;

const CONDITIONS = ['new', 'good', 'fair', 'worn'] as const;

export function ToolFormDialog({
  toolToEdit,
  isOpen,
  onClose,
}: ToolFormDialogProps) {
  const isEditing = !!toolToEdit;
  const createTool = useMutation(api.tools.create);
  const updateTool = useMutation(api.tools.update);

  const [name, setName] = useState(toolToEdit?.name ?? '');
  const [category, setCategory] = useState(toolToEdit?.category ?? 'power tools');
  const [condition, setCondition] = useState(toolToEdit?.condition ?? 'good');
  const [description, setDescription] = useState(toolToEdit?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a name for the tool.');
      return;
    }
    if (name.length > 80) {
      setError('Name must be 80 characters or fewer.');
      return;
    }
    if (description.length > 300) {
      setError('Description must be 300 characters or fewer.');
      return;
    }

    try {
      setLoading(true);
      if (isEditing && toolToEdit) {
        await updateTool({
          id: toolToEdit.id,
          name: name.trim(),
          category,
          condition,
          description: description.trim() || undefined,
        });
        toast.success('Listing saved.');
      } else {
        await createTool({
          name: name.trim(),
          category,
          condition,
          description: description.trim() || undefined,
        });
        toast.success('Tool listed.');
      }
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to save tool.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-line p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-soft hover:text-ink p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-semibold text-xl text-ink mb-1">
          {isEditing ? 'Edit tool' : 'List a tool'}
        </h2>
        <p className="text-sm text-ink-soft mb-5">
          {isEditing
            ? 'Update the details for your tool.'
            : 'Make a tool available for your neighbors to borrow.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-danger text-xs font-medium rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="toolName"
                className="block text-xs font-medium text-ink-soft"
              >
                Tool name
              </label>
              <span className="text-[11px] text-ink-soft">{name.length}/80</span>
            </div>
            <input
              id="toolName"
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cordless drill 18V"
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-hidden focus:ring-2 focus:ring-loop"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="toolCategory"
                className="block text-xs font-medium text-ink-soft mb-1"
              >
                Category
              </label>
              <select
                id="toolCategory"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-loop capitalize"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="capitalize">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="toolCondition"
                className="block text-xs font-medium text-ink-soft mb-1"
              >
                Condition
              </label>
              <select
                id="toolCondition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-loop capitalize"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="toolDesc"
                className="block text-xs font-medium text-ink-soft"
              >
                Short description (optional)
              </label>
              <span className="text-[11px] text-ink-soft">
                {description.length}/300
              </span>
            </div>
            <textarea
              id="toolDesc"
              rows={3}
              maxLength={300}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Include relevant accessories, battery sizes, or instructions..."
              className="w-full bg-surface border border-line rounded-lg p-3 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-hidden focus:ring-2 focus:ring-loop resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium bg-ink text-white rounded-lg hover:bg-ink/90 active:scale-95 disabled:opacity-50 transition-all min-h-[44px]"
            >
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'List tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
