import { getCurrentUser } from "@/lib/auth";

export async function getCurrentAdminAccess() {
  const user = await getCurrentUser();
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const email = user?.email?.toLowerCase() ?? null;
  const isAdmin = Boolean(email && allowedEmails.includes(email));

  return { user, isAdmin };
}
