import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { SessionProvider } from "@/components/providers/session-provider";
import { JsonLd } from "@/components/JsonLd";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const AdmissionsChatbot = dynamic(
  () => import("@/components/ui/chatbot").then((mod) => mod.AdmissionsChatbot)
);

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://crestoakcollege.com.ng"),
  title: {
    default: "CrestOak College | Badagry Campus Health & Technology",
    template: "%s | CrestOak College of Health Sciences, Management & Technology"
  },
  description: "CrestOak College of Health Sciences, Management & Technology. Accredited tertiary institution offering diploma and degree programs in Nursing, MLS, CHEW, Computer Science, and Business.",
  keywords: [
    "CrestOak College",
    "health sciences",
    "management",
    "technology",
    "college admissions",
    "Badagry college",
    "Nigeria higher education",
    "CCHSMT"
  ],
  alternates: {
    canonical: "https://crestoakcollege.com.ng"
  },
  openGraph: {
    title: "CrestOak College | Badagry Campus Health & Technology",
    description: "CrestOak College of Health Sciences, Management & Technology. Accredited tertiary institution offering diploma and degree programs in Nursing, MLS, CHEW, Computer Science, and Business.",
    url: "https://crestoakcollege.com.ng",
    siteName: "CrestOak College of Health Sciences, Management & Technology",
    images: [
      {
        url: "/atiba-crestoak-logo.png",
        width: 1200,
        height: 630,
        alt: "CrestOak College Seal"
      }
    ],
    locale: "en_NG",
    type: "website"
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "192x192" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  twitter: {
    card: "summary_large_image",
    title: "CrestOak College | Badagry Campus Health & Technology",
    description: "CrestOak College of Health Sciences, Management & Technology",
    images: ["/atiba-crestoak-logo.png"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="192x192" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        <JsonLd />
        <Analytics />
        <SessionProvider>
          {children}
        </SessionProvider>
        <AdmissionsChatbot />
      </body>
    </html>
  );
}
