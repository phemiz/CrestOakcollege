"use client";

import React, { useState, useEffect } from "react";
import ReviewsClient from "@/components/admin/ReviewsClient";
import { Loader2 } from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/admin/reviews.php", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("sessionToken") || ""}`,
        "X-CSRF-Token": localStorage.getItem("csrfToken") || "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data?.reviews)
          ? data.reviews
          : [];
        setReviews(records);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading reviews:", err);
        if (isMounted) {
          setReviews([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-brand-red" />
          <span>Loading reviews...</span>
        </div>
      </div>
    );
  }

  return <ReviewsClient reviews={reviews} />;
}
