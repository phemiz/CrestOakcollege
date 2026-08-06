"use client";

import React, { useState, useEffect } from "react";
import NewsClient from "@/components/admin/NewsClient";
import { Loader2 } from "lucide-react";

export default function NewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/news.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.newsList)) {
          setNewsList(data.newsList);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return <NewsClient newsList={newsList} />;
}
