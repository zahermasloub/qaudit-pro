import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        try {
          // Try database authentication first
          const user = await prisma.user.findUnique({
            where: { email: creds.email }
          });

          if (user && await bcrypt.compare(creds.password, user.password)) {
            return {
              id: user.id,
              name: user.email,
              email: user.email,
              role: user.role,
              locale: user.locale
            };
          }
        } catch (dbError) {
          console.log("Database not available, using fallback authentication:", dbError);

          // Fallback to hardcoded credentials when DB is not connected
          if (creds.email === "lead@example.com" && creds.password === "Passw0rd!") {
            return {
              id: "1",
              name: "IA Lead",
              email: "lead@example.com",
              role: "IA_Lead",
              locale: "ar"
            };
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.locale = (user as any).locale;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).locale = token.locale;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/shell`;
    },
  },
});

export { handler as GET, handler as POST };
