import React from "react";
import db from "@/lib/db";
import NewsClient from "@/components/admin/NewsClient";

export const revalidate = 0; // Fresh publications always

export default async function NewsPage() {
  const newsList = await db.news.findMany({
    where: {
      isDeleted: false
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return <NewsClient newsList={newsList} />;
}
