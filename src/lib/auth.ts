import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "./hash";
import { sanitizeInput } from "@/utils/sanitize";
import { isRateLimited } from "./rate-limit";
import db from "./db";
import { mockUsers, User as MockUser } from "@/data/users";

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

        console.log(`[NextAuth Auth] Login attempt for username: "${sanitizedUsername}" from IP: ${ip}`);

        // 3. Find user in the real database first
        let dbUser = null;
        try {
          dbUser = await db.user.findFirst({
            where: {
              OR: [
                { email: { equals: sanitizedUsername, mode: "insensitive" } },
                { student: { matricNo: { equals: sanitizedUsername, mode: "insensitive" } } },
                { staff: { staffNo: { equals: sanitizedUsername, mode: "insensitive" } } }
              ]
            },
            include: {
              role: true,
              student: {
                include: {
                  department: {
                    include: {
                      faculty: true
                    }
                  },
                  programme: true
                }
              },
              staff: {
                include: {
                  department: true
                }
              }
            }
          });
        } catch (dbErr) {
          console.error("[NextAuth Auth] Database query error:", dbErr);
        }

        if (dbUser) {
          console.log(`[NextAuth Auth] Found database user: "${dbUser.firstName} ${dbUser.lastName}" with role: "${dbUser.role.name}". Verifying password...`);
          
          const isValid = await verifyPassword(sanitizedPassword, dbUser.passwordHash);
          if (!isValid) {
            console.warn(`[NextAuth Auth] Authentication failed: Password verification failed for DB user "${sanitizedUsername}".`);
            throw new Error("Invalid username or password.");
          }

          let mappedRole = dbUser.role.name;
          if (dbUser.role.name === "SUPER_ADMIN") mappedRole = "Super Admin";
          else if (dbUser.role.name === "STUDENT") mappedRole = "Student";
          else if (dbUser.role.name === "LECTURER") mappedRole = "Lecturer";
          else if (dbUser.role.name === "BURSAR") mappedRole = "Bursary";
          else if (dbUser.role.name === "REGISTRAR") mappedRole = "Staff";

          return {
            id: dbUser.id,
            name: `${dbUser.firstName} ${dbUser.lastName}`,
            email: dbUser.email,
            role: mappedRole as any,
            registrationNumber: dbUser.student?.matricNo || dbUser.staff?.staffNo || undefined,
            department: dbUser.student?.department?.name || dbUser.staff?.department?.name || undefined,
            faculty: dbUser.student?.department?.faculty?.name || undefined,
          };
        }

        // 4. Fallback search in the mock database
        const user = mockUsers.find(
          (u: MockUser) => 
            u.username.toLowerCase() === sanitizedUsername.toLowerCase() ||
            (u.registrationNumber && u.registrationNumber.toLowerCase() === sanitizedUsername.toLowerCase())
        );

        if (!user) {
          console.warn(`[NextAuth Auth] Authentication failed: User "${sanitizedUsername}" not found in DB or mock database.`);
          throw new Error("Invalid username or password.");
        }

        console.log(`[NextAuth Auth] Found mock user: "${user.name}" with role: "${user.role}". Verifying password...`);
        const isValid = await verifyPassword(sanitizedPassword, user.passwordHash);

        if (!isValid) {
          console.warn(`[NextAuth Auth] Authentication failed: Password verification failed for mock user "${sanitizedUsername}".`);
          throw new Error("Invalid username or password.");
        }

        console.log(`[NextAuth Auth] Authentication successful for mock user: "${user.name}".`);

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
