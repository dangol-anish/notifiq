import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rows = await sql`
          SELECT * FROM users WHERE email = ${credentials.email}
        `;

        if (!rows.length) return null;

        const user = rows[0];
        if (!user.password_hash) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }

      // Handle GitHub OAuth
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as any;
        const email =
          githubProfile.email || `${githubProfile.login}@github.com`;

        const existing = await sql`
          SELECT * FROM users WHERE email = ${email}
        `;

        if (existing.length) {
          token.id = existing[0].id;
          token.email = existing[0].email;
          token.name = existing[0].name;
          token.picture = existing[0].image;
        } else {
          const rows = await sql`
            INSERT INTO users (name, email, image)
            VALUES (
              ${githubProfile.name || githubProfile.login},
              ${email},
              ${githubProfile.avatar_url ?? null}
            )
            RETURNING *
          `;
          token.id = rows[0].id;
          token.email = rows[0].email;
          token.name = rows[0].name;
          token.picture = rows[0].image;
        }
      }

      // Handle Google OAuth
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as any;
        const email = googleProfile.email;

        const existing = await sql`
          SELECT * FROM users WHERE email = ${email}
        `;

        if (existing.length) {
          token.id = existing[0].id;
          token.email = existing[0].email;
          token.name = existing[0].name;
          token.picture = existing[0].image;
        } else {
          const rows = await sql`
            INSERT INTO users (name, email, image)
            VALUES (
              ${googleProfile.name},
              ${email},
              ${googleProfile.picture ?? null}
            )
            RETURNING *
          `;
          token.id = rows[0].id;
          token.email = rows[0].email;
          token.name = rows[0].name;
          token.picture = rows[0].image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}

export async function getUserWorkspaceRole(
  userId: string,
  workspaceSlug: string,
): Promise<string | null> {
  const rows = await sql`
    SELECT wm.role FROM workspace_members wm
    JOIN workspaces w ON w.id = wm.workspace_id
    WHERE w.slug = ${workspaceSlug} AND wm.user_id = ${userId}
  `;
  return rows.length ? rows[0].role : null;
}
