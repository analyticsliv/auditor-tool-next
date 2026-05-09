import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import { ROLES, SUPER_ADMIN_EMAIL, PLANS, QUOTA_WINDOW_DAYS, addDays } from "@/app/config/plans";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/analytics.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 0,
  },
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at
          ? account.expires_at * 1000
          : account.expires_in
          ? Date.now() + account.expires_in * 1000
          : account.expires
          ? account.expires * 1000
          : Date.now() + 3600 * 1000;
        token.email = user?.email;
        token.name = user?.name;
        token.picture = user?.image;
      }

      // Refresh 60s BEFORE the token actually expires so a long-running call
      // (e.g. chatbot LLM completion) doesn't get a token that expires mid-flight.
      const REFRESH_BUFFER_MS = 60 * 1000;
      if (!token.expiresAt || Date.now() < token.expiresAt - REFRESH_BUFFER_MS) {
        return token;
      }
      // Once we're inside the refresh window, clear any stale error so the
      // attempt below isn't pre-empted by a previous failure.
      delete token.error;

      if (!token.refreshToken) {
        return { ...token, error: "RefreshAccessTokenError" };
      }

      try {
        const url = "https://oauth2.googleapis.com/token";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: token.refreshToken,
          }),
        });

        const refreshedTokens = await response.json();
        if (!response.ok) throw refreshedTokens;

        token.accessToken = refreshedTokens.access_token;
        token.expiresAt = refreshedTokens.expires_at
          ? refreshedTokens.expires_at * 1000
          : refreshedTokens.expires_in
          ? Date.now() + refreshedTokens.expires_in * 1000
          : refreshedTokens.expires
          ? refreshedTokens.expires * 1000
          : Date.now() + 3600 * 1000;

        return token;
      } catch (error) {
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.picture;
      return session;
    },
  },
  events: {
    /* ============================================================
       Fires after a successful sign-in (both new and returning users).
       Guarantees that every Google-authenticated user has a User row
       in MongoDB BEFORE they hit any API route. Previously we relied
       on lazy creation in getSessionUser() — but if any one of those
       calls failed (e.g. the legacy `accounts.accountId_1` index),
       the user would be stuck "authenticated but missing" and every
       API call returned 401.
       ============================================================ */
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return;
      const email = user?.email?.toLowerCase()?.trim();
      if (!email) return;

      try {
        await connectDB();
        const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
        const now = new Date();

        // Atomic upsert. $setOnInsert applies only on creation so we
        // don't clobber an existing user's role/quota/agency on every
        // sign-in. $set keeps name + lastLogin fresh.
        await User.findOneAndUpdate(
          { email },
          {
            $setOnInsert: {
              email,
              role: isSuperAdmin ? ROLES.SUPER_ADMIN : ROLES.FREE_USER,
              auditCount: 0,
              auditLimit: PLANS.free.auditLimit,
              chatbotCount: 0,
              chatbotLimit: PLANS.free.chatbotLimit,
              quotaStartDate: now,
              quotaResetDate: addDays(now, QUOTA_WINDOW_DAYS),
              status: 'active',
            },
            $set: {
              ...(user?.name ? { name: user.name } : {}),
              lastLogin: now,
            },
          },
          { upsert: true, setDefaultsOnInsert: true }
        );
      } catch (e) {
        // Don't block sign-in if the DB hiccups — getSessionUser() will
        // attempt the same upsert on the first API call as a safety net.
        console.error(
          '[auth events.signIn] user upsert failed for', email,
          'code:', e?.code, 'name:', e?.codeName, 'msg:', e?.message
        );
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
