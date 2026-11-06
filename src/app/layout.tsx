import type { Metadata } from 'next';
import { Bricolage_Grotesque, Public_Sans } from 'next/font/google';
import './globals.css';
import { ConvexClientProvider } from '@/providers/ConvexClientProvider';
import { Toaster } from 'sonner';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-bricolage',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-public-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LendLoop — Borrow what you need. Lend what you don’t.',
  description:
    'A neighborhood tool-lending board. Borrow what you need. Lend what you don’t.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${publicSans.variable}`}>
      <body className="bg-bench text-ink antialiased min-h-screen">
        <ConvexClientProvider>
          {children}
          <Toaster position="bottom-right" richColors />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
