"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardTopBar } from "@/components/DashboardTopBar";
import { broker } from "@/lib/storage";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!broker.getKey()) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="skeleton h-8 w-48 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[color:var(--color-bg-canvas)]">
      <DashboardSidebar />
      <div className="lg:ps-[68px]">
        <DashboardTopBar />
        <main className="px-4 md:px-6 lg:px-8 py-8 md:py-10 max-w-[1440px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
