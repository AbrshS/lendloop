import React from 'react';
import {
  CheckCircle2,
  Clock,
  Hourglass,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'available'
  | 'onloan'
  | 'pending'
  | 'approved'
  | 'declined'
  | 'cancelled'
  | 'returned'
  | 'overdue';

interface StatusChipProps {
  status: StatusType;
  label?: string;
  className?: string;
}

export function StatusChip({ status, label, className }: StatusChipProps) {
  const configs: Record<
    StatusType,
    { text: string; bg: string; textCol: string; border: string; icon: React.ReactNode }
  > = {
    available: {
      text: 'Available',
      bg: 'bg-emerald-50',
      textCol: 'text-[#2F7D4F]',
      border: 'border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    onloan: {
      text: 'On loan',
      bg: 'bg-blue-50',
      textCol: 'text-[#3B5B8C]',
      border: 'border-blue-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    pending: {
      text: 'Pending',
      bg: 'bg-amber-50',
      textCol: 'text-[#9A6A12]',
      border: 'border-amber-200',
      icon: <Hourglass className="w-3.5 h-3.5" />,
    },
    approved: {
      text: 'Approved',
      bg: 'bg-blue-50',
      textCol: 'text-[#3B5B8C]',
      border: 'border-blue-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    declined: {
      text: 'Declined',
      bg: 'bg-red-50',
      textCol: 'text-[#B3261E]',
      border: 'border-red-200',
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    cancelled: {
      text: 'Cancelled',
      bg: 'bg-slate-100',
      textCol: 'text-[#53656E]',
      border: 'border-slate-200',
      icon: <Ban className="w-3.5 h-3.5" />,
    },
    returned: {
      text: 'Returned',
      bg: 'bg-emerald-50',
      textCol: 'text-[#2F7D4F]',
      border: 'border-emerald-200',
      icon: <RotateCcw className="w-3.5 h-3.5" />,
    },
    overdue: {
      text: 'Overdue',
      bg: 'bg-red-50',
      textCol: 'text-[#B3261E]',
      border: 'border-red-200',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
  };

  const current = configs[status] ?? configs.available;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        current.bg,
        current.textCol,
        current.border,
        className,
      )}
    >
      {current.icon}
      <span>{label ?? current.text}</span>
    </span>
  );
}
