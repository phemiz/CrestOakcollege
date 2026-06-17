import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: 'Student' | 'Lecturer' | 'Staff' | 'Bursary' | 'Admin' | 'Super Admin';
      registrationNumber?: string;
      department?: string;
      faculty?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: 'Student' | 'Lecturer' | 'Staff' | 'Bursary' | 'Admin' | 'Super Admin';
    registrationNumber?: string;
    department?: string;
    faculty?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: 'Student' | 'Lecturer' | 'Staff' | 'Bursary' | 'Admin' | 'Super Admin';
    registrationNumber?: string;
    department?: string;
    faculty?: string;
  }
}
