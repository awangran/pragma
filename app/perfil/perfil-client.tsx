"use client";
import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, ArrowUpRight, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FavoriteButton } from "@/components/favorite-button";
import { UpdatePasswordForm } from "@/components/update-password-form";
import { LogoutButton } from "@/components/logout-button";
import type { Favorito } from "./page";

type Cuenta = { email: string; nombre: string; departamento: string; edad: string;
  opinion: string; avatar: string; creada: string };
  const campo = "mt-2 w-full rounded-xl border border-[#dce4f5] bg-white px-4 py-3 text-sm outline-none focus:border-[#5574ff]";
  const boton = "inline-flex items-center gap-2 border-b border-[#5574ff]/40 pb-1 text-sm font-medium text-[#5574ff] disabled:opacity-50";
  const departamentos = ["Amazonas","Antioquia","Arauca","Atlántico","Bogotá","Bolívar","Boyacá","Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca","Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño","Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia","Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada"];
  function fotoSegura(s: string | null) {
  if (!s) return null;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try { const u=new URL(s); return ["http:","https:"].includes(u.protocol) ? u.href : null; } catch { return null; }
  }
  function hrefSeguro(s: string) {
  return /^\/(candidatos|articulos|eventos|seguimiento)(\/|#|$)/.test(s) ? s : "/dashboard";
  }
  export default function PerfilClient({ cuenta, favoritos, errorFavoritos }: {
  cuenta: Cuenta; favoritos: Favorito[]; errorFavoritos: boolean;
  }) {
  const router=useRouter();
  const [tab,setTab]=useState<"guardados"|"cuenta"|"seguridad">("guardados");
  const searchParams = useSearchParams();
  const seccion = searchParams.get("seccion");
  useEffect(() => {
    setTab(seccion === "cuenta" ? "cuenta" : seccion === "seguridad" ? "seguridad" : "guardados");
  }, [seccion]);
  const [filtro,setFiltro]=useState("todos");
  const [items,setItems]=useState(favoritos);
  const [form,setForm]=useState(cuenta);
  const [saving,setSaving]=useState(false);
  const [mensaje,setMensaje]=useState("");
  const [fallo,setFallo]=useState(false);
  const mostrar=items.filter(f=>filtro==="todos" || f.tipo===filtro);
  async function guardarCuenta(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); if(saving) return;
    if(form.edad && (!/^\d+$/.test(form.edad) || Number(form.edad)>120)) {setFallo(true);setMensaje("Ingresa una edad válida.");return;}
    if(form.avatar && !fotoSegura(form.avatar)) {setFallo(true);setMensaje("Ingresa una URL válida para tu foto.");return;}
    setSaving(true);setMensaje("");
    try {
    const {error}=await createClient().auth.updateUser({data:{
      full_name:form.nombre.trim(),state:form.departamento,age:form.edad,
      opinion:form.opinion.trim(),avatar_url:form.avatar.trim() || null,
    }});
    setFallo(Boolean(error));setMensaje(error ? error.message : "Tu información quedó actualizada.");
    if(!error) router.refresh();
    } catch {setFallo(true);setMensaje("No pudimos guardar tu información.");}
    finally {setSaving(false);}
  }
  const avatar=fotoSegura(form.avatar);
  return <main>
    <header className="border-b border-[#e2e9f8] bg-gradient-to-r from-[#f2f5ff] via-[#f5f0fc] to-white">
    <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">Tu espacio en Pragma Radar</p>
      <div className="mt-5 flex items-center gap-5">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#e4eafa]">
        {avatar ? <Image src={avatar} alt="" fill sizes="80px" unoptimized className="object-cover" />:<UserRound aria-hidden className="h-8 w-8 text-[#7863bd]" />}
      </div>
      <div><h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{form.nombre.trim() || "Mi perfil"}</h1>
        <p className="mt-2 break-all text-sm text-slate-600">{cuenta.email}</p></div>
      </div>
    </div>
    </header>
    <nav aria-label="Secciones de mi perfil" className="border-b border-[#e2e9f8]">
    <div className="mx-auto flex max-w-6xl gap-7 px-6">
      {([["guardados","Mis favoritos"],["cuenta","Mi información"],["seguridad","Contraseña"]] as const).map(([key,label])=>
      <button key={key} type="button" onClick={()=>setTab(key)} aria-current={tab===key?"page":undefined}
        className={`border-b-2 py-5 text-xs font-semibold ${tab===key?"border-[#5574ff] text-[#5574ff]":"border-transparent text-slate-500"}`}>{label}</button>)}
    </div>
    </nav>
    <div className="mx-auto max-w-6xl px-6 py-10">
    {tab==="guardados" && <section aria-labelledby="favoritos-title">
      <div className="flex flex-wrap items-center justify-between gap-5"><h2 id="favoritos-title" className="text-2xl font-semibold tracking-[-0.03em]">Lo que quieres tener a mano.</h2>
      <div className="flex items-center gap-5"><span className="text-xs text-[#7863bd]">{items.length} guardados</span><Link href="/perfil/explorar" className={boton}>Explorar para guardar</Link></div></div>
      <div className="mt-6 flex flex-wrap gap-5">
      {[["todos","Todo"],["articulo","Artículos"],["evento","Eventos"],["candidato","Personas"]].map(([key,label])=>
        <button type="button" key={key} aria-pressed={filtro===key} onClick={()=>setFiltro(key)}
        className={`border-b pb-1 text-xs ${filtro===key?"border-[#5574ff] text-[#5574ff]":"border-transparent text-slate-500"}`}>{label}</button>)}
      </div>
      {errorFavoritos && <p role="alert" className="mt-6 text-sm text-rose-700">No pudimos cargar tus favoritos. Recarga la página para intentarlo de nuevo.</p>}
      {!errorFavoritos && !mostrar.length && <div className="mt-10 border-y border-[#e2e9f8] py-12">
      <Bookmark aria-hidden className="h-7 w-7 text-[#7863bd]" />
      <h3 className="mt-4 text-lg font-semibold">Aquí empieza tu colección.</h3>
      <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">Pulsa Guardar en un artículo, evento o perfil para encontrarlo aquí.</p>
      <div className="mt-5 flex flex-wrap gap-5">{[["/perfil/explorar?tipo=articulo","Guardar artículos"],["/perfil/explorar?tipo=evento","Guardar eventos"],["/perfil/explorar?tipo=candidato","Guardar personas"]].map(([href,label])=><Link key={href} href={href} className={boton}>{label}</Link>)}</div>
      </div>}
      <ul className="mt-6 grid gap-x-10 md:grid-cols-2">{mostrar.map(f=>{
      const foto=fotoSegura(f.foto);const key=f.tipo+":"+f.recurso_id;
      return <li key={key} className="relative border-b border-[#e2e9f8] py-6 pr-10">
        <Link href={hrefSeguro(f.href)} className="group flex items-center gap-4">
        {foto && <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#edf2ff]"><Image src={foto} alt="" fill sizes="96px" unoptimized className="object-cover" /></div>}
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7863bd]">{f.tipo==="articulo"?"Artículo":f.tipo==="evento"?"Evento":["14","21"].includes(f.recurso_id)?"Gobierno nacional":"Perfil"}</p>
          <h3 className="mt-2 text-base font-semibold leading-6 group-hover:text-[#5574ff]">{f.titulo}</h3>
          <span className="mt-3 inline-flex items-center gap-2 text-xs text-[#5574ff]">Abrir<ArrowUpRight aria-hidden className="h-3 w-3" /></span></div>
        </Link>
        <div className="absolute right-0 top-6"><FavoriteButton tipo={f.tipo} recursoId={f.recurso_id} initialSaved compact onChange={saved=>{if(!saved)setItems(prev=>prev.filter(item=>item.tipo+":"+item.recurso_id!==key));}} /></div>
      </li>;
      })}</ul>
    </section>}
    {tab==="cuenta" && <section className="max-w-2xl"><h2 className="text-2xl font-semibold tracking-[-0.03em]">Mi información.</h2>
      <p className="mt-3 text-xs leading-6 text-slate-500">Miembro desde {new Intl.DateTimeFormat("es-CO",{month:"long",year:"numeric",timeZone:"America/Bogota"}).format(new Date(cuenta.creada))}. Tus favoritos son privados.</p>
      <form onSubmit={guardarCuenta} className="mt-7 space-y-5">
      <label className="block text-xs font-semibold">Nombre<input className={campo} value={form.nombre} autoComplete="name" maxLength={100} onChange={e=>setForm({...form,nombre:e.target.value})} /></label>
      <label className="block text-xs font-semibold">Correo<input className={campo+" text-slate-500"} value={cuenta.email} readOnly type="email" /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-xs font-semibold">Departamento<select className={campo} value={form.departamento} onChange={e=>setForm({...form,departamento:e.target.value})}>
        <option value="">Selecciona un departamento</option>
        {form.departamento && !departamentos.includes(form.departamento) && <option value={form.departamento}>{form.departamento}</option>}
        {departamentos.map(d=><option key={d} value={d}>{d}</option>)}</select></label>
        <label className="block text-xs font-semibold">Edad<input className={campo} type="number" min={0} max={120} step={1} value={form.edad} onChange={e=>setForm({...form,edad:e.target.value})} /></label>
      </div>
      <label className="block text-xs font-semibold">URL de tu foto<input className={campo} type="url" value={form.avatar} onChange={e=>setForm({...form,avatar:e.target.value})} placeholder="https://…" /></label>
      <label className="block text-xs font-semibold">¿Qué esperas de Pragma Radar?<textarea className={campo} rows={3} maxLength={1000} value={form.opinion} onChange={e=>setForm({...form,opinion:e.target.value})} /></label>
      {mensaje && <p role={fallo?"alert":"status"} className={`text-sm ${fallo?"text-rose-700":"text-emerald-700"}`}>{mensaje}</p>}
      <button type="submit" disabled={saving} className={boton}>{saving?"Guardando…":"Guardar información"}</button>
      </form>
    </section>}
    {tab==="seguridad" && <section className="max-w-xl"><UpdatePasswordForm embedded /></section>}
    <div className="mt-14 border-t border-[#e2e9f8] pt-6"><LogoutButton /></div>
    </div>
  </main>;
}
