import type { Metadata } from "next";
import { generateSEO } from "@/utils/seo";

export const metadata: Metadata = generateSEO({
  title: "Unified Portal Login",
  description: "Secure login gate for CrestOak College (CCHSMT) student and administrative portals. Log in to register courses, check semester results, or settle invoices.",
  path: "/login",
  keywords: [
    "CrestOak Student Login",
    "CCHSMT Portal Login",
    "Course registration login badagry",
    "Check results CrestOak"
  ]
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
