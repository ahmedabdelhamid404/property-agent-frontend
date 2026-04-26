"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { Tabs } from "@/components/Tabs";
import { useI18n } from "@/components/I18nProvider";
import { StatsSection } from "./_sections/StatsSection";
import { LeadsSection } from "./_sections/LeadsSection";
import { InventorySection } from "./_sections/InventorySection";
import { SettingsSection } from "./_sections/SettingsSection";
import { broker } from "@/lib/storage";

type TabId = "stats" | "leads" | "inventory" | "settings";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<TabId>("stats");

  useEffect(() => {
    if (!broker.getKey()) {
      router.replace("/signup");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  if (!authChecked) {
    return (
      <>
        <SiteHeader showBrokerSession />
        <div className="deck py-20">
          <div className="skeleton h-8 w-48 mb-6" />
          <div className="skeleton h-4 w-96" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader showBrokerSession />

      <div className="deck pt-12 pb-6">
        <span className="eyebrow mb-2 block rise-1">
          {t("dashboard.eyebrow")}
        </span>
        <h1 className="rise-1 font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,2.8rem)] font-semibold tracking-[-0.02em] text-[color:var(--color-fg-primary)]">
          {t("dashboard.title")}{" "}
          <span className="text-[color:var(--color-fg-brand)]">
            {t("dashboard.titleAccent")}
          </span>
        </h1>
      </div>

      <div className="deck rise-2">
        <Tabs
          tabs={[
            { id: "stats", label: t("dashboard.tabStats") },
            { id: "leads", label: t("dashboard.tabLeads") },
            { id: "inventory", label: t("dashboard.tabInventory") },
            { id: "settings", label: t("dashboard.tabSettings") },
          ]}
          active={tab}
          onChange={(id) => setTab(id as TabId)}
        />

        <div className="py-10">
          {tab === "stats" && <StatsSection />}
          {tab === "leads" && <LeadsSection />}
          {tab === "inventory" && <InventorySection />}
          {tab === "settings" && <SettingsSection />}
        </div>
      </div>
    </>
  );
}
