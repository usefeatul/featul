import { getServerSession } from "@featul/auth/session";
import { redirect } from "next/navigation";

export function buildSignInRedirectPath(targetPath: string): string {
  return `/auth/signin?redirect=${encodeURIComponent(targetPath)}`;
}

/** Redirects unauthenticated visitors to sign-in with a return path. */
export async function requireSignedInUser(targetPath: string) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user?.id) {
    redirect(buildSignInRedirectPath(targetPath));
  }

  return {
    ...user,
    id: user.id,
  };
}
