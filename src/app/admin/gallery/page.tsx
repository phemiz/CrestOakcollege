"use client";

import React, { useState, useEffect } from "react";
import GalleryClient from "@/components/admin/GalleryClient";
import { Loader2 } from "lucide-react";

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/gallery.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.galleryItems)) {
          setGalleryItems(data.galleryItems);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return <GalleryClient galleryItems={galleryItems} />;
}
