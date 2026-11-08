import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { StatusChip } from './StatusChip';
import { cn } from '@/lib/utils';

export interface ToolTagProps {
  id: string;
  name: string;
  category: string;
  condition?: string;
  description?: string;
  isOwner?: boolean;
  isTrustedLender?: boolean;
  isOnLoan?: boolean;
  onLoanUntil?: string;
  onRequest?: () => void;
  publicOnly?: boolean;
  className?: string;
}

export function ToolTag({
  name,
  category,
  condition,
  description,
  isOwner,
  isTrustedLender,
  isOnLoan,
  onLoanUntil,
  onRequest,
  publicOnly,
  className,
}: ToolTagProps) {
  return (
    <div
      className={cn(
        'relative bg-surface border border-line rounded-xl p-5 pt-8 tool-tag shadow-sm transition-transform hover:-translate-y-0.5',
        className,
      )}
    >
      {/* Punched hole at top-left with tape accent */}
      <div className="tag-hole" aria-hidden="true" />

      {/* Header: Title and optional badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-semibold text-lg text-ink leading-tight">
          {name}
        </h3>
        {!publicOnly && isTrustedLender && (
          <span
            className="inline-flex items-center gap-1 bg-tape text-ink text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm shrink-0"
            title="Trusted Lender"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trusted</span>
          </span>
        )}
      </div>

      {/* Meta tags: Category & Condition */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-ink-soft bg-bench/70 px-2 py-0.5 rounded">
          {category}
        </span>
        {!publicOnly && condition && (
          <span className="text-xs text-ink-soft">
            • condition: <span className="capitalize">{condition}</span>
          </span>
        )}
      </div>

      {/* Description (authenticated only) */}
      {!publicOnly && description && (
        <p className="text-sm text-ink-soft line-clamp-2 mb-4">
          {description}
        </p>
      )}

      {/* Footer / Actions */}
      {!publicOnly && (
        <div className="pt-3 border-t border-line/50 flex items-center justify-between gap-2 mt-auto">
          {isOnLoan ? (
            <StatusChip
              status="onloan"
              label={onLoanUntil ? `On loan until ${onLoanUntil}` : 'On loan'}
            />
          ) : (
            <StatusChip status="available" label="Available" />
          )}

          {isOwner ? (
            <span className="text-xs text-ink-soft italic">Your tool</span>
          ) : onRequest ? (
            <button
              type="button"
              disabled={isOnLoan}
              onClick={onRequest}
              className={cn(
                'text-xs font-medium px-3 py-1.5 rounded-lg transition-colors min-h-[36px]',
                isOnLoan
                  ? 'bg-bench text-ink-soft cursor-not-allowed opacity-60'
                  : 'bg-ink text-white hover:bg-ink/90 active:scale-95',
              )}
            >
              Request to borrow
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}

