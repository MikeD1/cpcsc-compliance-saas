"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserConfig } from "@/lib/supabase";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } = getSupabaseBrowserConfig();
  if (!url || !publishableKey) {
    return null;
  }

  browserClient = createClient(url, publishableKey);
  return browserClient;
}
