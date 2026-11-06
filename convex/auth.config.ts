/**
 * Convex auth config — validates Clerk-issued JWTs.
 *
 * `application` verifies the JWT `iss` (issuer) claim matches
 * CLERK_JWT_ISSUER_DOMAIN. Convex fetches Clerk's JWKS to verify signatures.
 *
 * @see docs/SECURITY.md
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
};
