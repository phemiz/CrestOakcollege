import type { Metadata } from "next";
import { Montserrat, Inter } from "next/font/google";
import { AdmissionsChatbot } from "@/components/ui/chatbot";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
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
                "email": "info.crestoakcollege@gmail.com",
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
        {children}
        <AdmissionsChatbot />
      </body>
    </html>
  );
}


