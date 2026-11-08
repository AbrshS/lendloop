'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { BellRing } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

interface LoanActivityFeedProps {
  loanId: Id<'loans'>;
}

export function LoanActivityFeed({ loanId }: LoanActivityFeedProps) {
  const events = useQuery(api.automation.listActivityForLoan, { loanId });

  if (!events || events.length === 0) return null;

  // Show the latest activity
  const latest = events[events.length - 1];
  if (!latest) return null;

  function formatEventMessage(type: string): string {
    switch (type) {
      case 'loan.requested':
        return 'Lender notified of request';
      case 'loan.approved':
        return 'Borrower notified of approval';
      case 'loan.declined':
        return 'Borrower notified of decline';
      case 'loan.cancelled':
        return 'Lender notified of cancellation';
      case 'loan.returned':
        return 'Tool marked returned';
      case 'overdue_reminder':
      case 'reminder':
        return 'Overdue reminder sent';
      default:
        return 'Activity logged';
    }
  }

  const relativeTime = formatDistanceToNow(new Date(latest.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-soft/80 mt-1">
      <BellRing className="w-3 h-3 text-tape shrink-0" />
      <span>
        {formatEventMessage(latest.type)} • {relativeTime}
      </span>
    </div>
  );
}

