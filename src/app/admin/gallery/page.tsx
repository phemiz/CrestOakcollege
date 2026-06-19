import React from "react";
import db from "@/lib/db";
import GalleryClient from "@/components/admin/GalleryClient";

export const revalidate = 0; // Fresh photos always

export default async function GalleryPage() {
  const galleryItems = await db.gallery.findMany({
    where: {
      isDeleted: false
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return <GalleryClient galleryItems={galleryItems} />;
}
