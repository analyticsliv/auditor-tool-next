import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = Date.now() + account.expires_in * 1000;
      }

      if (Date.now() < token.expiresAt) {
        return token;
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
        token.expiresAt = Date.now() + refreshedTokens.expires_in * 1000;

        return token;
      } catch (error) {
        console.error("Error refreshing access token:", error);
        return { ...token, error: "RefreshAccessTokenError" };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
  },
  url: process.env.NEXT_PUBLIC_BASE_URL,
  secret: process.env.NEXTAUTH_SECRET,

  // // ✅ Add debug logging (remove after fixing)
  // debug: process.env.NODE_ENV === 'development',

  // // ✅ Ensure cookies work with your domain
  // cookies: {
  //   sessionToken: {
  //     name: `next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: process.env.NODE_ENV === 'production'
  //     }
  //   }
  // }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
