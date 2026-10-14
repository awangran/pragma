import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import PerfilClient from "./perfil-client";
import type { TipoFavorito } from "./actions";

export type Favorito = {
  tipo: TipoFavorito; recurso_id: string; titulo: string;
  foto: string | null; href: string; created_at: string;
};
async function Contenido() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data, error } = await supabase.from("favoritos")
    .select("tipo,recurso_id,titulo,foto,href,created_at")
    .eq("usuario_id", user.id).order("created_at", { ascending: false });
  const meta = user.user_metadata;
  const texto = (v: unknown) => typeof v === "string" ? v : "";
  return <>
    <Navbar user={{ avatarUrl: texto(meta.avatar_url) || undefined }} />
    <PerfilClient cuenta={{
      email: user.email ?? "", nombre: texto(meta.full_name) || texto(meta.name),
      departamento: texto(meta.state), edad: String(meta.age ?? ""),
      opinion: texto(meta.opinion), avatar: texto(meta.avatar_url),
      creada: user.created_at,
    }} favoritos={(data ?? []) as Favorito[]} errorFavoritos={Boolean(error)} />
  </>;
}
export default function PerfilPage() {
  return <div className="min-h-screen bg-white text-[#111b3f]">
    <Suspense fallback={<p role="status" className="px-6 py-12 text-sm text-[#7863bd]">Cargando tu perfil…</p>}>
      <Contenido />
    </Suspense>
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Cargando pie de página…</div>}><Footer /></Suspense>
  </div>;
}
