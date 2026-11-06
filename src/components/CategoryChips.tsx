import React from 'react';
import { cn } from '@/lib/utils';

export const CATEGORIES_LIST = [
  'All',
  'Power tools',
  'Garden',
  'Kitchen',
  'Camping',
  'Hand tools',
  'Cleaning',
  'Other',
] as const;

interface CategoryChipsProps {
  selected: string;
  onSelect: (category: string) => void;
  className?: string;
}

export function CategoryChips({
  selected,
  onSelect,
  className,
}: CategoryChipsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none',
        className,
      )}
    >
      {CATEGORIES_LIST.map((cat) => {
        const isSelected = selected.toLowerCase() === cat.toLowerCase();
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap border',
              isSelected
                ? 'bg-ink text-white border-ink'
                : 'bg-white text-ink-soft border-line hover:text-ink hover:border-ink-soft',
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
