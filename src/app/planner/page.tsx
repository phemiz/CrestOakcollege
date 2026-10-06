"use client";

import { useEffect } from "react";

export default function PlannerIndex() {
  useEffect(() => {
    window.location.replace("/planner/dashboard/");
  }, []);
  return null;
}
