import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { FavoriteButton } from "@/components/favorite-button";
import type { TipoFavorito } from "../actions";
type Props={searchParams:Promise<{tipo?:string;pagina?:string}>};
async function Contenido({searchParams}:Props) {
 const params=await searchParams;
 const tipo:TipoFavorito=params.tipo==="evento"?"evento":params.tipo==="candidato"?"candidato":"articulo";
 const pagina=Math.max(1,Math.min(10000,Number.parseInt(params.pagina ?? "1",10)||1));
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user) redirect("/auth/login");
 const tabla=tipo==="evento"?"eventos":tipo==="candidato"?"candidatos":"articulos";
 let consulta=supabase.from(tabla).select("*");
 if(tipo==="candidato") consulta=consulta.or("tipo.is.null,tipo.neq.Minister");
 const {data,error}=await consulta.order("id",{ascending:false}).range((pagina-1)*24,pagina*24);
 const filas=(data ?? []) as Record<string,unknown>[];
 const next=filas.length>24;
 const texto=(valor:unknown)=>typeof valor==="string"?valor:null;
 const avatar=texto(user.user_metadata.avatar_url) || undefined;
 return <>
 <Navbar user={{avatarUrl:avatar}} />
 <main className="mx-auto max-w-6xl px-6 py-10">
  <Link href="/perfil" className="text-xs text-[#5574ff] underline underline-offset-4">Volver a mi perfil</Link>
  <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">Tu próxima lectura o encuentro</p>
  <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Encuentra algo para guardar.</h1>
  <nav aria-label="Tipos de contenido" className="my-8 flex gap-6 text-sm">{[["articulo","Artículos"],["evento","Eventos"],["candidato","Personas"]].map(([key,label])=>
   <Link key={key} href={"/perfil/explorar?tipo="+key} aria-current={tipo===key?"page":undefined} className={tipo===key?"border-b border-[#5574ff] pb-1 text-[#5574ff]":"text-slate-500"}>{label}</Link>)}</nav>
  {error && <p role="alert" className="text-sm text-rose-700">No pudimos cargar este contenido. Intenta nuevamente.</p>}
  {!error && !filas.length && <p className="text-sm text-slate-500">Todavía no hay contenido en esta página.</p>}
  <ul className="grid gap-x-10 md:grid-cols-2">{filas.slice(0,24).map(item=>{
   const id=String(item.id);
   const nombre=texto(item.nombre) ?? texto(item.titulo) ?? "Evento";
   const foto=texto(item.foto) ?? texto(item.avatar) ?? texto(item.imagen_url);
   let imagen:string|null=null;
   if(foto?.startsWith("/")&&!foto.startsWith("//")) imagen=foto;
   else if(foto) {try {const url=new URL(foto);if(["https:","http:"].includes(url.protocol)) imagen=url.href;}catch{}}
   const href=tipo==="candidato"?(["14","21"].includes(id)?"/seguimiento#gobierno":"/candidatos/"+id):tipo==="articulo"?"/articulos/"+id:"/eventos";
   return <li key={id} className="border-b border-[#e2e9f8] py-6">
    <Link href={href} className="flex items-center gap-4">
     {imagen&&<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"><Image src={imagen} alt="" fill sizes="96px" unoptimized className="object-cover"/></div>}
     <h2 className="text-base font-semibold leading-7">{nombre}</h2>
    </Link>
    <div className="mt-3"><FavoriteButton tipo={tipo} recursoId={id}/></div>
   </li>;
  })}</ul>
  <nav aria-label="Páginas" className="mt-8 flex gap-6 text-xs text-[#5574ff]">
   {pagina>1 && <Link href={"/perfil/explorar?tipo="+tipo+"&pagina="+(pagina-1)}>Anterior</Link>}
   {next && <Link href={"/perfil/explorar?tipo="+tipo+"&pagina="+(pagina+1)}>Siguiente</Link>}
  </nav>
 </main></>;
}
export default function ExplorarPage(props:Props){return <Suspense fallback={<p role="status" className="p-8 text-sm">Cargando contenido…</p>}><Contenido {...props}/></Suspense>;}
