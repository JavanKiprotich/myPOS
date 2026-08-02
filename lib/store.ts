import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function getCurrentStoreId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("session")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const session = await verifySession(token);

  if (!session) {
    throw new Error("Invalid session");
  }

  return String(session.storeId);
}