// Mock services and API handlers

import { Admission } from "@/types";

export const fetchApplications = async (): Promise<Admission[]> => {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("cchsmt_submitted_applications");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const submitApplicationService = async (app: Admission): Promise<boolean> => {
  // Mock API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const saved = localStorage.getItem("cchsmt_submitted_applications") || "[]";
  let list = [];
  try {
    list = JSON.parse(saved);
  } catch {
    list = [];
  }
  list.push(app);
  localStorage.setItem("cchsmt_submitted_applications", JSON.stringify(list));
  return true;
};
