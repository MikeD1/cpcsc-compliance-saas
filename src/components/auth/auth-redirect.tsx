import { redirect } from "next/navigation";
import { getCurrentAccess } from "@/lib/access";

export async function redirectIfAuthenticated() {
  const access = await getCurrentAccess();

  if (access.user) {
    redirect(access.hasActiveSubscription ? "/dashboard" : "/controls");
  }
}
