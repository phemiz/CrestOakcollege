import { Metadata } from "next";

export const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.crestoak.com.ng";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Builds consistent and compliant Next.js metadata objects for standard and dynamic pages.
 */
export function generateSEO({
  title,
  description,
  path = "",
  keywords = [],
  ogImage = "/crestoak-banner.png", // Fallback college branding banner
  noIndex = false
}: SEOProps): Metadata {
  const absoluteUrl = `${siteUrl}${path}`;
  const completeTitle = `${title} | CrestOak College (CCHSMT)`;

  const baseMetadata: Metadata = {
    title: completeTitle,
    description,
    keywords: [
      "CrestOak College",
      "CCHSMT",
      "CrestOak College Badagry",
      "Health Sciences Nigeria",
      "Nursing Sciences badagry",
      "Atiba University partner",
      "Criminology studies Lagos",
      "Management and Technology Lagos",
      ...keywords
    ],
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      title: completeTitle,
      description,
      url: absoluteUrl,
      siteName: "CrestOak College of Health Sciences, Management & Technology",
      images: [
        {
          url: `${siteUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: completeTitle,
      description,
      images: [`${siteUrl}${ogImage}`],
    },
  };

  if (noIndex) {
    baseMetadata.robots = {
      index: false,
      follow: false
    };
  }

  return baseMetadata;
}
