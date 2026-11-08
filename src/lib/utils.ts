import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(msOrIso: number | string | Date): string {
  const d = new Date(msOrIso);
  const nowYear = new Date().getFullYear();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const month = months[d.getUTCMonth()];
  const day = d.getUTCDate();
  return d.getUTCFullYear() === nowYear
    ? `${month} ${day}`
    : `${month} ${day}, ${d.getUTCFullYear()}`;
}

