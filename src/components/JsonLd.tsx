import React from "react";

export function JsonLd() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "CrestOak College of Health Sciences, Management & Technology",
    "alternateName": "CCHSMT",
    "url": "https://crestoakcollege.com.ng",
    "logo": "https://crestoakcollege.com.ng/crestoak-seal.png",
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
      "streetAddress": "Badagry Campus, 6/8 Isaac Street, Ibereko",
      "addressLocality": "Badagry",
      "addressRegion": "Lagos State",
      "addressCountry": "Nigeria"
    },
    "slogan": "Igniting Changes Through Knowledge"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData)
      }}
    />
  );
}
