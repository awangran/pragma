"use client";
import { useState } from "react";
import Link from "next/link";
import { votarOpinion } from "@/app/seguimiento/opinion-actions";
import { normalizarResumen, type ResumenOpinion } from "@/lib/opinion-promesa";
export default function OpinionPromesa({propuestaId,initial,conSesion,errorInicial=false}:{
  propuestaId:number;initial:ResumenOpinion;conSesion:boolean;errorInicial?:boolean;
  }) {
  const [resumen,setResumen]=useState(initial);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState(errorInicial?"No pudimos cargar la opinión ciudadana. Recarga para intentarlo de nuevo.":"");
  const [message,setMessage]=useState("");
  const [disponible,setDisponible]=useState(!errorInicial);
  const porcentajeSi=resumen.total ? Math.round(resumen.si/resumen.total*100) : 0;
  const porcentajeNo=resumen.total ? 100-porcentajeSi : 0;
  async function votar(valor:boolean|null) {
    if(busy) return;setBusy(true);setError("");setMessage("");
    try {
    const resultado=await votarOpinion(propuestaId,valor);
    if(resultado.error) {setError(resultado.error);return;}
    if("resumen" in resultado) {setResumen(normalizarResumen(resultado.resumen));setDisponible(true);}
    setMessage(valor===null?"Retiraste tu voto.":"Tu opinión quedó guardada. Puedes cambiarla cuando quieras.");
    } catch {setError("No pudimos guardar tu opinión.");}
    finally {setBusy(false);}
  }
  return <section id="opinion-ciudadana" aria-labelledby="opinion-title" className="mt-8 max-w-3xl scroll-mt-24 border-t border-[#dfe7f8] pt-6">
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7863bd]">Opinión ciudadana</p>
      <h3 id="opinion-title" className="mt-2 text-base font-semibold text-[#111b3f]">¿Crees que se está cumpliendo?</h3>
    </div>
    {conSesion ? <div className="flex items-center gap-5">
      {([true,false] as const).map(valor=><button key={String(valor)} type="button" disabled={busy} aria-pressed={resumen.mi_voto===valor}
      onClick={()=>void votar(valor)}
      className={`border-b-2 px-2 py-2 text-sm transition disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff] ${resumen.mi_voto===valor?(valor?"border-emerald-600 font-semibold text-emerald-700":"border-rose-600 font-semibold text-rose-700"):"border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"}`}>
      {valor?"Sí":"No"}{resumen.mi_voto===valor&&<span className="sr-only">, tu opinión actual</span>}
      </button>)}
      {busy&&<span role="status" className="text-[10px] text-slate-500">Guardando…</span>}
    </div>:<Link href="/auth/login" className="text-xs text-[#5574ff] underline underline-offset-4">Inicia sesión para opinar</Link>}
    </div>
    {disponible && resumen.total>0 ? <div className="mt-4">
    <div role="img" aria-label={`Opinión ciudadana: ${porcentajeSi}% Sí; ${porcentajeNo}% No.`} className="flex h-[6px] overflow-hidden rounded-full bg-slate-200">
      <div className="bg-emerald-500" style={{width:resumen.si/resumen.total*100+"%"}}/>
      <div className="bg-rose-400" style={{width:resumen.no/resumen.total*100+"%"}}/>
    </div>
    <div aria-hidden="true" className="mt-3 flex justify-between text-xs">
      <span className="text-emerald-700">Sí · {porcentajeSi}%</span>
      <span className="text-rose-700">No · {porcentajeNo}%</span>
    </div>
    </div>:disponible&&<p className="mt-4 text-sm text-slate-500">Comparte tu opinión para iniciar esta lectura colectiva.</p>}
    {error&&<p role="alert" className="mt-3 text-xs leading-6 text-rose-700">{error}</p>}
    {message&&<p role="status" className="sr-only">{message}</p>}
    <details className="group mt-4">
    <summary className="flex w-fit cursor-pointer list-none items-center gap-2 py-2 text-xs text-slate-500 hover:text-[#7863bd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
      Cómo leer la opinión ciudadana <span aria-hidden="true" className="transition-transform group-open:rotate-180">⌄</span>
    </summary>
    <div className="mt-3 max-w-2xl space-y-3 text-xs leading-6 text-slate-500">
      <p>La línea muestra qué proporción de las personas que participaron cree que la promesa se está cumpliendo: verde para Sí y rojo para No. Cada cuenta aporta una respuesta y todas tienen el mismo peso.</p>
      <p>Revisa los avances y sus fuentes antes de responder. Puedes cambiar o retirar tu opinión cuando quieras.</p>
      <p>Es una lectura de la comunidad que participa en Pragma Radar, no una encuesta representativa del país. El estado y el porcentaje de avance se evalúan por separado, a partir de la evidencia registrada.</p>
      {conSesion && resumen.mi_voto!==null && <button type="button" disabled={busy} onClick={()=>void votar(null)} className="text-[#7863bd] underline underline-offset-4 disabled:opacity-50">Retirar mi opinión</button>}
      {!conSesion && <Link href="/auth/sign-up" className="inline-block text-[#5574ff] underline underline-offset-4">Crear una cuenta</Link>}
    </div>
  </details>
</section>;}
