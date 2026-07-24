import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSafeSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    return null;
  }
}
