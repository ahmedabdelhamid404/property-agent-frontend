"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { admin } from "@/lib/storage";
import { AdminDashboard } from "./_components/AdminDashboard";

export default function AdminPage() {
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    setHasKey(!!admin.getKey());
  }, []);

  if (hasKey === null) {
    return (
      <div className="deck py-20">
        <div className="skeleton h-8 w-48" />
      </div>
    );
  }

  if (!hasKey) {
    return (
      <AdminGate
        onAuthed={() => {
          setHasKey(true);
          toast.success("اتصلتنا بالأدمن");
        }}
      />
    );
  }

  return <AdminDashboard onSignOut={() => setHasKey(false)} />;
}

function AdminGate({ onAuthed }: { onAuthed: () => void }) {
  const [keyInput, setKeyInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function tryKey(e: React.FormEvent) {
    e.preventDefault();
    if (!keyInput.trim()) return;
    setSubmitting(true);
    // Quick sanity probe — call /api/admin/stats with the key. If 401, the
    // key is wrong; if anything else (200/5xx) we accept it (5xx ≠ "invalid key").
    try {
      const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
      const r = await fetch(`${base.replace(/\/$/, "")}/api/admin/stats`, {
        headers: { "X-Admin-Key": keyInput.trim() },
      });
      if (r.status === 401 || r.status === 403) {
        toast.error("المفتاح غلط");
        setSubmitting(false);
        return;
      }
      admin.setKey(keyInput.trim());
      onAuthed();
    } catch {
      toast.error("ما قدرتش أتأكد من المفتاح");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center px-6 py-16">
      <form onSubmit={tryKey} className="sheet-deed w-full max-w-md p-8 md:p-10">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <p className="eyebrow text-center mb-2">منطقة المنصة</p>
        <h1 className="font-[family-name:var(--font-display)] text-[2rem] leading-[1.05] text-[color:var(--color-ink)] text-center mb-2">
          لوحة الأدمن
        </h1>
        <p className="font-[family-name:var(--font-serif)] italic text-center text-[0.95rem] text-[color:var(--color-ink-soft)] mb-8">
          محتاجين مفتاح الإدارة عشان نكمل.
        </p>

        <Input
          label="X-Admin-Key"
          type="password"
          placeholder="••••••••"
          dir="ltr"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          autoComplete="off"
        />

        <div className="mt-8 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-serif)] text-[0.92rem] text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink)]"
          >
            ← الرئيسية
          </Link>
          <Button type="submit" loading={submitting}>
            دخول
          </Button>
        </div>
      </form>
    </div>
  );
}
