import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      const isDashboard = !nextUrl.pathname.startsWith("/login") &&
        !nextUrl.pathname.startsWith("/api") &&
        !nextUrl.pathname.startsWith("/_next") &&
        nextUrl.pathname !== "/favicon.ico";

      // Bảo vệ các route dashboard chung
      if (isDashboard) {
        if (!isLoggedIn) return false;

        // Bảo vệ đặc biệt cho trang quản lý Admin (Chỉ SUPER_ADMIN)
        if (nextUrl.pathname.startsWith("/settings/users")) {
          if (userRole !== "SUPER_ADMIN") {
            return Response.redirect(new URL("/", nextUrl));
          }
        }

        return true;
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.image = user.image;
      }
      // Hỗ trợ cập nhật session động
      if (trigger === "update" && session?.image) {
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
  trustHost: true,
} satisfies NextAuthConfig;
