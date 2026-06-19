import React from "react";

interface StructuredDataProps {
  data: object;
}

/**
 * Reusable component to safely render Schema.org JSON-LD structured schemas.
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
      }}
    />
  );
}
