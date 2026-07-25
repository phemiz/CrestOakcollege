import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { SessionProvider } from "@/components/providers/session-provider";
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
  metadataBase: new URL("https://www.crestoak.com.ng"),
  title: {
    default: "CrestOak College | Health Sciences, Management & Technology",
    template: "%s | CrestOak College (CCHSMT)"
  },
  description: "CrestOak College of Health Sciences, Management and Technology (Badagry, Lagos) offers top-tier programs in Applied Health Sciences, Law, Social & Management Sciences, Agriculture, and Applied Sciences. Igniting changes through knowledge.",
  keywords: [
    "CrestOak College",
    "Health Science College Nigeria",
    "Management and Technology College",
    "CrestOak College Badagry",
    "Applied Health Sciences Lagos",
    "Nursing Science Badagry",
    "Criminology and Security Studies Nigeria",
    "Computer Science College Lagos",
    "CCHSMT"
  ],
  alternates: {
    canonical: "https://www.crestoak.com.ng"
  },
  openGraph: {
    title: "CrestOak College of Health Sciences, Management and Technology",
    description: "Empowering future leaders through world-class health, management, and technology education. Located in Badagry, Lagos.",
    url: "https://www.crestoak.com.ng",
    siteName: "CrestOak College",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrestOak College of Health Sciences, Management and Technology",
    description: "Igniting changes through knowledge. Admissions open for Applied Health, Law, Management, and Applied Sciences.",
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
      <body className="min-h-full flex flex-col font-sans bg-white text-slate-900">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollegeOrUniversity",
              "name": "CrestOak College of Health Sciences, Management and Technology",
              "alternateName": "CCHSMT",
              "url": "https://www.crestoak.com.ng",
              "logo": "https://www.crestoak.com.ng/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+2348155884804",
                "contactType": "Admissions",
                "email": "info@crestoakcollege.com.ng",
                "areaServed": "NG",
                "availableLanguage": "en"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "6/8 Isaac Street, Ibereko",
                "addressLocality": "Badagry",
                "addressRegion": "Lagos",
                "addressCountry": "NG"
              },
              "slogan": "Igniting Changes Through Knowledge"
            })
          }}
        />
        <SessionProvider>
          {children}
        </SessionProvider>
        <AdmissionsChatbot />
      </body>
    </html>
  );
}


