'use client';

import { ReactNode } from 'react';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const clerkPubKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ConvexProviderWithClerk client={convex} useAuth={useAuth as any}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
