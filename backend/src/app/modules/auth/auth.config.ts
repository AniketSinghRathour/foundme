import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../../common/config/prisma.js";
import { env } from "../../common/config/env.js";
import { sendEmail } from "../../common/config/mailer.js";

/**
 * Better-Auth instance — the single source of auth configuration.
 *
 * Providers: email/password + Google OAuth (§6).
 * Database: Prisma adapter pointing at the same Neon Postgres
 * that Lambda shares (§1).
 *
 * This file must be exported as `auth` for the Better-Auth CLI
 * to discover it during schema generation.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000"], // Allow frontend cross-origin requests (§9: lockdown deferred)

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Click <a href="${url}">here</a> to verify your email address.</p>`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
