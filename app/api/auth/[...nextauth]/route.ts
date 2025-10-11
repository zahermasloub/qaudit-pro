import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(creds) {
        // TODO: استبدل بمنطق تحقق حقيقي (DB/LDAP/SSO)
        if (creds?.email && creds?.password === "Passw0rd!") {
          return {
            id: "1",
            name: "IA Lead",
            email: creds.email,
            locale: "ar"
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/shell`;
    },
  },
});

export { handler as GET, handler as POST };
