"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Propuesta = { id: number; titulo: string; candidato_id: number | null };
export default function AdminSeguimientoListado() {
  const [datos, setDatos] = useState<Propuesta[]>([]);
  const [ultimos, setUltimos] = useState<Record<number, number>>({});
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Cargando…");
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const db = createClient();
        const { data: auth, error: ae } = await db.auth.getUser();
        if (ae || !auth.user) throw new Error("Inicia sesión para administrar el seguimiento.");
        const { data: perfil, error: pe } = await db.from("profiles").select("role").eq("id", auth.user.id).single();
        if (pe || perfil?.role !== "admin") throw new Error("Necesitas permisos de administrador.");
        const { data, error } = await db.from("propuestas").select("id,titulo,candidato_id").eq("candidato_id", 14).order("id", { ascending: true });
        if (error) throw error;
        const { data: historial, error: he } = await db.from("seguimientos").select("id,propuesta_id").order("created_at", { ascending: false }).order("id", { ascending: false });
        if (he) throw he;
        const mapa: Record<number, number> = {};
        for (const r of historial ?? []) if (mapa[r.propuesta_id] === undefined) mapa[r.propuesta_id] = r.id;
        if (activo) { setAdmin(true); setDatos(data ?? []); setUltimos(mapa); setEstado(""); }
      } catch (error) { if (activo) setEstado(error instanceof Error ? error.message : "No se pudieron cargar los compromisos."); }
    }
    void cargar(); return () => { activo = false; };
  }, []);
  const normalizar = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const visibles = datos.filter(p => normalizar(`${p.id} ${p.titulo}`).includes(normalizar(busqueda)));
  return <main className="mx-auto max-w-6xl px-6 py-10 text-[#111b3f]">
    <p className="text-xs uppercase tracking-widest text-[#7863bd]">Administración · Pragma Radar</p>
    <h1 className="mt-3 text-3xl font-semibold">Seguimiento de compromisos</h1>
    <p className="mt-3 text-sm leading-6 text-slate-600">Elige una propuesta para registrar qué ocurrió y añadir la evidencia que respalda cada actualización.</p>
    {estado && <p role="status" className="mt-6 rounded-xl bg-[#f2f5ff] p-5">{estado}</p>}
    {admin && <>
      <label className="mt-8 block text-sm">Buscar por título o número<input type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)} className="mt-2 block w-full rounded-xl border border-[#dfe7f8] p-3" placeholder="Seguridad, educación, 109…" /></label>
      <p className="my-5 text-xs text-slate-500">{visibles.length} compromisos</p>
      <ul className="space-y-3">{visibles.map(p=><li key={p.id} className="flex flex-col gap-4 rounded-2xl border border-[#dfe7f8] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs text-[#7863bd]">Propuesta {p.id}</p><h2 className="mt-1 font-semibold">{p.titulo}</h2></div>
        <div className="flex shrink-0 flex-wrap gap-5 text-sm"><Link className="text-[#5574ff] underline underline-offset-4" href={`/admin/promesas/agregar?propuesta_id=${p.id}`}>Registrar avance</Link>{ultimos[p.id] !== undefined && <Link className="text-[#7863bd] underline underline-offset-4" href={`/admin/promesas/${ultimos[p.id]}/editar`}>Editar último avance</Link>}<Link className="text-slate-500 underline underline-offset-4" href={`/seguimiento/${p.id}`}>Página pública</Link></div>
      </li>)}</ul>
      {!visibles.length && <p className="py-8 text-slate-500">No hay coincidencias con esta búsqueda.</p>}
    </>}
  </main>;
}
