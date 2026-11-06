'use client';

import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface RequestDialogProps {
  toolId: Id<'tools'>;
  toolName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDialog({
  toolId,
  toolName,
  isOpen,
  onClose,
}: RequestDialogProps) {
  const requestLoan = useMutation(api.loans.request);

  // Default to tomorrow until 3 days later
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]!;
  const defaultEnd = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]!;

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [requestNote, setRequestNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const startMs = new Date(startDate + 'T00:00:00Z').getTime();
    const endMs = new Date(endDate + 'T00:00:00Z').getTime();
    const todayMs = new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z').getTime();

    if (startMs < todayMs) {
      setError('Start date cannot be in the past.');
      return;
    }
    if (endMs < startMs) {
      setError('End date must be on or after the start date.');
      return;
    }
    const daysDiff = Math.round((endMs - startMs) / (24 * 60 * 60 * 1000));
    if (daysDiff > 30) {
      setError('Loans cannot exceed 30 days.');
      return;
    }

    try {
      setLoading(true);
      await requestLoan({
        toolId,
        startDate: BigInt(startMs) as unknown as bigint,
        endDate: BigInt(endMs) as unknown as bigint,
        requestNote: requestNote.trim() || undefined,
      });
      toast.success('Request sent.');
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to submit borrow request.');
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
          Request to borrow
        </h2>
        <p className="text-sm text-ink-soft mb-5">{toolName}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-danger text-xs font-medium rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="startDate"
                className="block text-xs font-medium text-ink-soft mb-1"
              >
                Start date
              </label>
              <div className="relative">
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-loop"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-xs font-medium text-ink-soft mb-1"
              >
                End date
              </label>
              <div className="relative">
                <input
                  id="endDate"
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm text-ink focus:outline-hidden focus:ring-2 focus:ring-loop"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="message"
                className="block text-xs font-medium text-ink-soft"
              >
                Note to lender (optional)
              </label>
              <span className="text-[11px] text-ink-soft">
                {requestNote.length}/300
              </span>
            </div>
            <textarea
              id="message"
              rows={3}
              maxLength={300}
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="e.g. Building a planter box this weekend. Will take great care of it!"
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
              {loading ? 'Sending...' : 'Send request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
