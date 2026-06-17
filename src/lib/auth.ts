import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { mockUsers } from "@/data/users";
import { verifyPassword } from "./hash";
import { sanitizeInput } from "@/utils/sanitize";
import { isRateLimited } from "./rate-limit";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username/Reg No", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please enter your username and password.");
        }

        // 1. Retrieve client IP and apply rate limiting
        let ip = "127.0.0.1";
        if (req && req.headers) {
          const xForwardedFor = req.headers["x-forwarded-for"];
          if (typeof xForwardedFor === "string") {
            ip = xForwardedFor.split(",")[0].trim();
          } else if (Array.isArray(xForwardedFor)) {
            ip = xForwardedFor[0].trim();
          } else {
            const xRealIp = req.headers["x-real-ip"];
            if (typeof xRealIp === "string") {
              ip = xRealIp;
            }
          }
        }

        if (isRateLimited(ip)) {
          throw new Error("Too many login attempts. Please try again in 30 seconds.");
        }

        // 2. Sanitize user inputs to prevent injection and XSS
        const sanitizedUsername = sanitizeInput(credentials.username.trim());
        const sanitizedPassword = credentials.password; 

        console.log(`[NextAuth Auth] Login attempt for username: "${sanitizedUsername}" (Sanitized from: "${credentials.username}") from IP: ${ip}`);

        // 3. Find user in the mock database (allow match on username or registration number)
        const user = mockUsers.find(
          (u) => 
            u.username.toLowerCase() === sanitizedUsername.toLowerCase() ||
            (u.registrationNumber && u.registrationNumber.toLowerCase() === sanitizedUsername.toLowerCase())
        );

        if (!user) {
          console.warn(`[NextAuth Auth] Authentication failed: User "${sanitizedUsername}" not found in mock database.`);
          throw new Error("Invalid username or password.");
        }

        console.log(`[NextAuth Auth] Found user: "${user.name}" with role: "${user.role}". Verifying password...`);

        // 4. Verify password with Argon2id Wasm
        const isValid = await verifyPassword(sanitizedPassword, user.passwordHash);

        if (!isValid) {
          console.warn(`[NextAuth Auth] Authentication failed: Password verification failed for user "${sanitizedUsername}".`);
          throw new Error("Invalid username or password.");
        }

        console.log(`[NextAuth Auth] Authentication successful for user: "${user.name}".`);

        // Return user object without the password hash
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          registrationNumber: user.registrationNumber,
          department: user.department,
          faculty: user.faculty,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.registrationNumber = user.registrationNumber;
        token.department = user.department;
        token.faculty = user.faculty;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.registrationNumber = token.registrationNumber;
        session.user.department = token.department;
        session.user.faculty = token.faculty;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes session duration (standard security)
  },
  jwt: {
    maxAge: 30 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development-only-replace-in-env",
};
