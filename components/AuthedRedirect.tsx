"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { broker } from "@/lib/storage";

/**
 * Drop on landing/signup pages. If the visitor has a stored broker key
 * we shove them at /dashboard via router.replace, so the back button
 * can't return them to the public funnel after they've signed up.
 */
export function AuthedRedirect({ to = "/dashboard" }: { to?: string }) {
  const router = useRouter();
  useEffect(() => {
    if (broker.getKey()) router.replace(to);
  }, [router, to]);
  return null;
}
