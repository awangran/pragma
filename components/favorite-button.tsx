"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { guardarFavorito, type TipoFavorito } from "@/app/perfil/actions";

export function FavoriteButton({ tipo, recursoId, initialSaved, compact = false, onChange }: {
  tipo: TipoFavorito; recursoId: string | number; initialSaved?: boolean;
  compact?: boolean; onChange?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(initialSaved ?? false);
  const [loading, setLoading] = useState(initialSaved === undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needLogin, setNeedLogin] = useState(false);
  const id = String(recursoId);

  useEffect(() => {
    let active = true;
    setError(""); setNeedLogin(false);
    setSaved(initialSaved ?? false);
    if (initialSaved !== undefined) { setLoading(false); return; }
    setLoading(true);
    async function load() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { if (active) setNeedLogin(true); return; }
        const { data, error: readError } = await supabase.from("favoritos").select("recurso_id")
          .eq("usuario_id", user.id).eq("tipo", tipo).eq("recurso_id", id).maybeSingle();
        if (active) {
          setSaved(Boolean(data));
          if (readError) setError("No pudimos consultar tus favoritos.");
        }
      } catch {
        if (active) setError("No pudimos consultar tus favoritos.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [tipo, id, initialSaved]);

  async function toggle() {
    if (loading || busy) return;
    if (needLogin) return;
    setBusy(true); setError("");
    try {
      const result = await guardarFavorito(tipo, id, !saved);
      if (result.error) { setError(result.error); return; }
      setSaved(!saved); onChange?.(!saved);
    } catch { setError("No pudimos guardar el cambio."); }
    finally { setBusy(false); }
  }
  const label = saved ? "Quitar de favoritos" : "Guardar en favoritos";
  return <div className={compact ? "relative" : ""}>
    {needLogin ? <Link href="/auth/login" title="Inicia sesión para guardar"
      className="inline-flex items-center gap-2 p-2 text-xs text-[#5574ff] underline underline-offset-4">
      <Bookmark className="h-4 w-4" aria-hidden />{!compact && "Inicia sesión para guardar"}
    </Link> : <button type="button" onClick={toggle} disabled={loading || busy} aria-pressed={saved}
      aria-label={label} title={label}
      className="inline-flex items-center gap-2 rounded-lg p-2 text-xs font-medium text-[#5574ff] hover:bg-[#eef2ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">
      <Bookmark aria-hidden className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {!compact && (busy ? "Guardando…" : loading ? "Cargando…" : saved ? "Guardado" : "Guardar")}
    </button>}
    {error && <p role="alert" className={compact ? "absolute right-0 top-full z-20 w-52 rounded-lg border bg-white p-3 text-xs text-rose-700 shadow" : "mt-2 text-xs text-rose-700"}>{error}</p>}
  </div>;
}
