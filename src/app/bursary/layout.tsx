import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tuition Fees & Bursary Guide (2026/2027)",
  description: "Official Approved Fee Structure for the 2026/2027 Academic Session at CrestOak College (CCHSMT). Calculate tuition, hostel charges, and other academic payments.",
  keywords: [
    "CrestOak College Fees",
    "CrestOak College Bursary",
    "School Fees 2026/2027",
    "Tuition Fee Nigeria",
    "Accredited College School Fees",
    "Nursing School Fees Badagry"
  ],
  alternates: {
    canonical: "https://crestoakcollege.com.ng/bursary"
  }
};

export default function BursaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
