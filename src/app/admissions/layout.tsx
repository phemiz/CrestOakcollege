import type { Metadata } from "next";
import { generateSEO } from "@/utils/seo";

export const metadata: Metadata = generateSEO({
  title: "Online Admissions Application & Tracking Portal (2026/2027)",
  description: "Official admissions portal for CrestOak College (CCHSMT) Badagry, Lagos. Start your online application, track admission guidelines, and check JAMB cut-off marks.",
  path: "/admissions",
  keywords: [
    "CrestOak Admissions",
    "Applied Health Admissions Lagos",
    "JAMB Cut-Off Badagry",
    "Accredited nursing entry Badagry",
    "Online registration CCHSMT"
  ]
});

export default function AdmissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
