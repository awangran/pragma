"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const { error: authError } = await createClient().auth.signOut();
      if (authError) { setError("No pudimos cerrar la sesión."); return; }
      router.push("/auth/login"); router.refresh();
    } catch { setError("No pudimos cerrar la sesión."); }
    finally { setBusy(false); }
  }
  return <div>
    <Button type="button" variant="outline" onClick={logout} disabled={busy}
      className="rounded-full border border-red-200 bg-white px-6 py-2 font-medium text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-300">
      {busy ? "Cerrando sesión…" : "Cerrar sesión"}
    </Button>
    {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
  </div>;
}
