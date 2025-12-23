import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentailProvider from "next-auth/providers/credentials";
import { loginUser } from "@/service/userService";
import { getUserByEmail, registerOauthUser, updateOauthUser} from "@/db/querie/userQuerie";
import NextAuth from "next-auth/next";


export const authOptions: NextAuthOptions = {

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOELE_SECRET!,
        }),

        CredentailProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email"},
                password: { label: "Password", type: "password"}
            },
            async authorize(credentials): Promise<any | null> {
                if (!credentials?.email || !credentials?.password) {
                  return null
                }
              
                try {
                  const loginResponse = await loginUser(
                    credentials.email,
                    credentials.password
                  )

                  return {
                    id: loginResponse.user.id,
                    name: loginResponse.user.username,
                    email: loginResponse.user.email
                  }
              
                } catch (error) {
                  console.error("Login failed:", error)
                  return null
                }
              }
              
        })
    ],

    callbacks: {
        async signIn({ user, account, email}) {
            if (account?.provider === "google") {

                try {
                    const email = user.email;
                    const providerId = account.providerAccountId;
                    const username = user.name || email?.split("@")[0];

                    const existingUser = await getUserByEmail(email!);
                    if(existingUser) {
                        await updateOauthUser(email!, username!, providerId, account.provider);
                    } else {
                        await registerOauthUser(username!, email!, account.provider, providerId);
                    }
                    return true;
                } catch(err) {
                    console.error("Error during sign in:", err);
                    return false;
                }
            }
            return true;
        },

        async jwt({token, user, account}): Promise<any> {
            if(user) {
                token.id = user.id!;
                token.email = user.email!;
                token.name = user.name!;
            }

            if(account) {
                token.accessToken = account.access_token;
            }

            return token;
        },

        async session({ session, token}): Promise<any> {
            if(session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }

            try {

                const user = await getUserByEmail(session.user?.email!);
                if(user) {
                    session.user = {
                        ...session.user,
                        id: user.id,
                        name: user.username,
                        email: user.email
                    }
                }

            } catch(err) {
                console.error("Error during session callback:", err);
                return null;
            }
            return session;

        }
    },

    pages: {
        signIn: '/login',
        error: '/login',
        signOut: '/login'
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, 
    },

    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            }
        }
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };