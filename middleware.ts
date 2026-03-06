import NextAuth from "next-auth";
import { authConfig } from "./src/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Pattern này bảo vệ tất cả các route ngoại trừ api, _next/static, _next/image, favicon.ico và trang login
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)", "/"],
};
