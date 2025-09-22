import { headers } from "next/headers";
import { auth } from "./auth";

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (error) {
    console.error("Error getting server session", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Authentication required");
  }
  return session;
}

export async function requireUser() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("User authentication required");
  }
  return session.user;
}