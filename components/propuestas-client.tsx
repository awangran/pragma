"use client";

import Image from "next/image";
import { useId, useMemo, useState } from "react";
import { ChevronDown, Ear, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

interface Propuesta {
  id: string | number;
  titulo: string;
  tema_id: string | number | null;
  que_pasa: string | null;
  que_propone: string | null;
  que_cambia: string | null;
  tema?: { titulo?: string | null; tituloExtendido?: string | null } | null;
}
interface PropuestasPorTema {
  [key: string]: { tituloExtendido?: string | null; temaId: string; items: Propuesta[] };
}
interface PropuestasClientProps {
  propuestasPorTema: PropuestasPorTema;
  propuestasArray: Propuesta[];
  tipsMap?: Record<string, string | null>;
  candidato?: { nombre: string; avatar?: string | null };
}
const normalizar = (texto: string) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// Agrupa oraciones para facilitar la lectura sin resumir ni alterar el consejo.
function bloquesConsejo(texto: string): string[] {
  const parrafos = texto.trim().split(/\n\s*\n/).filter(Boolean);
  return parrafos.flatMap((parrafo) => {
    const oraciones = parrafo.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÜÑ¿¡])/);
    const bloques: string[] = [];
    for (let i = 0; i < oraciones.length; i += 2) {
      bloques.push(oraciones.slice(i, i + 2).join(" ").trim());
    }
    return bloques;
  });
}
// El mismo orden y las mismas fotografías se aplican a todas las candidaturas.
const TEMAS = [
  { match: "educacion", src: "/tema-educacion.jpg" },
  { match: "salud", src: "/tema-salud.jpg" },
  { match: "econom", src: "/tema-economia.jpg" },
  { match: "equidad", src: "/seguimiento-equidad.jpg" },
  { match: "seguridad", src: "/tema-seguridad.jpg" },
  { match: "paz", src: "/pragma-paz.avif" },
  { match: "medio ambiente", src: "/tema-medio-ambiente.jpg" },
  { match: "energia", src: "/tema-energia.jpg" },
  { match: "infraestructura", src: "/tema-infraestructura.jpg" },
  { match: "ciencia", src: "/tema-ciencia-tecnologia.jpg" },
  { match: "politica exterior", src: "/tema-politica-exterior.jpg" },
  { match: "empleo", src: "/seguimiento-campo.jpg" },
];
function temaVisual(titulo: string) {
  const texto = normalizar(titulo);
  const index = TEMAS.findIndex((tema) => texto.includes(tema.match));
  return { orden: index < 0 ? TEMAS.length : index, src: index < 0 ? "/seguimiento-colombia.jpg" : TEMAS[index].src };
}

export function PropuestasClient({ propuestasPorTema, propuestasArray, tipsMap = {}, candidato }: PropuestasClientProps) {
  const uid = useId();
  const [busqueda, setBusqueda] = useState("");
  const [expandedTemas, setExpandedTemas] = useState<Set<string>>(new Set());
  const [cerradosEnBusqueda, setCerradosEnBusqueda] = useState<Set<string>>(new Set());
  const query = normalizar(busqueda.trim());
  const temas = useMemo(() => Object.entries(propuestasPorTema).sort(([a], [b]) => temaVisual(a).orden - temaVisual(b).orden || a.localeCompare(b, "es")), [propuestasPorTema]);
  const visibles = temas.map(([titulo, data]) => {
    const coincideTema = normalizar(`${titulo} ${data.tituloExtendido ?? ""}`).includes(query);
    const items = !query || coincideTema ? data.items : data.items.filter((p) => normalizar([p.titulo, p.que_pasa, p.que_propone, p.que_cambia].filter(Boolean).join(" ")).includes(query));
    return { titulo, data, items };
  }).filter(({ items }) => items.length > 0);
  const resultados = visibles.reduce((total, tema) => total + tema.items.length, 0);
  const estaAbierto = (titulo: string) => query ? !cerradosEnBusqueda.has(titulo) : expandedTemas.has(titulo);
  const todosAbiertos = visibles.length > 0 && visibles.every(({ titulo }) => estaAbierto(titulo));
  function toggleTema(titulo: string) {
    const actualizar = (prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(titulo)) next.delete(titulo); else next.add(titulo);
      return next;
    };
    if (query) setCerradosEnBusqueda(actualizar); else setExpandedTemas(actualizar);
  }
  function toggleTodos() {
    if (query) setCerradosEnBusqueda(todosAbiertos ? new Set(visibles.map(({ titulo }) => titulo)) : new Set());
    else setExpandedTemas(todosAbiertos ? new Set() : new Set(visibles.map(({ titulo }) => titulo)));
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 border-y border-[#e2e9f8] py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor={`${uid}-buscar`} className="sr-only">Buscar dentro de las propuestas</label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input id={`${uid}-buscar`} type="search" value={busqueda} onChange={(event) => { setBusqueda(event.target.value); setCerradosEnBusqueda(new Set()); }} placeholder="Busca un tema o una palabra…" className="h-11 w-full rounded-full border border-[#dbe3f5] bg-[#f8faff] pl-10 pr-10 text-sm text-[#111b3f] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5574ff]" />
          {busqueda && <button type="button" onClick={() => { setBusqueda(""); setCerradosEnBusqueda(new Set()); }} aria-label="Limpiar búsqueda" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500"><X aria-hidden="true" className="h-4 w-4" /></button>}
        </div>
        <div className="flex items-center justify-between gap-4">
          <p role="status" aria-live="polite" className="text-xs text-slate-500">{resultados} {resultados === 1 ? "propuesta" : "propuestas"}{query ? " encontradas" : " registradas"}</p>
          {visibles.length > 0 && <button type="button" onClick={toggleTodos} className="text-xs font-semibold text-[#3458d8] hover:underline">{todosAbiertos ? "Cerrar temas" : "Abrir temas"}</button>}
        </div>
      </div>

      <div className="space-y-5">
        {visibles.map(({ titulo, data, items }) => {
          const isExpanded = estaAbierto(titulo);
          const panelId = `${uid}-${data.temaId}-panel`;
          const buttonId = `${uid}-${data.temaId}-boton`;
          const tipId = data.items[0]?.tema_id;
          const tip = tipId != null ? tipsMap[String(tipId)] : null;
          return (
            <section key={titulo} id={data.temaId} className="scroll-mt-28 overflow-hidden rounded-[24px] border border-[#e2e9f8] bg-white">
              <h3>
                <button id={buttonId} type="button" aria-expanded={isExpanded} aria-controls={panelId} onClick={() => toggleTema(titulo)} className="group flex w-full items-stretch text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#5574ff]">
                  <div className="relative w-24 shrink-0 overflow-hidden sm:w-40 md:w-52" style={{ minHeight: 120 }}>
                    <Image src={temaVisual(titulo).src} alt={`Imagen de contexto para ${titulo}`} fill sizes="(max-width: 640px) 96px, (max-width: 768px) 160px, 208px" className="object-cover transition duration-500 group-hover:scale-105 motion-reduce:transform-none" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3 bg-[#f5f7ff] px-4 py-5 sm:px-7">
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6555c9]">{items.length} {items.length === 1 ? "propuesta" : "propuestas"}</span>
                      <span className="mt-2 block text-lg font-semibold leading-tight tracking-[-0.025em] text-[#111b3f] sm:text-2xl">{titulo}</span>
                      {data.tituloExtendido && <span className="mt-2 hidden max-w-xl line-clamp-2 text-xs font-normal leading-5 text-slate-600 md:block">{data.tituloExtendido}</span>}
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8e1f7] bg-white text-[#3458d8]"><ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`} /></span>
                  </div>
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isExpanded}>
                {isExpanded && (
                  <div className="px-5 pb-3 sm:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e9f8] py-4">
                      {candidato ? <div className="flex items-center gap-2.5">{candidato.avatar && <Image src={candidato.avatar} alt="" width={32} height={32} unoptimized className="h-8 w-8 shrink-0 rounded-full object-cover" />}<p className="text-xs text-slate-600">Propuestas de <span className="font-semibold text-[#111b3f]">{candidato.nombre}</span></p></div> : <p className="text-xs text-slate-500">Propuestas registradas para este tema</p>}
                      {tip && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#dcd3ee] bg-[#f3eefb] px-4 py-2.5 text-xs font-normal text-[#70558f] transition hover:border-[#bba6dd] hover:bg-[#ece4f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7863bd]">
                              <Ear aria-hidden="true" className="h-4 w-4" />No te dejes endulzar el oído
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto rounded-[28px] border-[#e5ddf0] bg-[#fdfcff] p-0 text-[#111b3f] shadow-[0_24px_80px_rgba(55,40,90,0.16)]">
                            <DialogHeader className="border-b border-[#e5ddf0] bg-gradient-to-br from-[#eee7f8] to-[#edf2ff] px-6 pb-6 pt-7 text-left sm:px-8">
                              <span aria-hidden="true" className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/80 bg-white/60 text-[#7863bd]"><Ear className="h-5 w-5" /></span>
                              <DialogTitle className="max-w-sm pr-5 text-2xl font-medium leading-tight tracking-[-0.025em] text-[#44335f]">No te dejes endulzar el oído</DialogTitle>
                              <DialogDescription className="pt-3 text-sm leading-6 text-[#6b6280]">Antes de aceptar una propuesta, revisa sus recursos, sus plazos y lo que deja sin explicar.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 px-6 py-7 sm:px-8">
                              {bloquesConsejo(tip).map((bloque, index) => (
                                <div key={index} className={index === 0 ? "rounded-[18px] border border-[#e7dff2] bg-[#f3eef9] p-5" : "px-1"}>
                                  <p className={`whitespace-pre-line text-[15px] font-normal leading-7 ${index === 0 ? "text-[#5c4876]" : "text-[#526074]"}`}>{bloque}</p>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    {items.map((p) => {
                      const numero = data.items.indexOf(p) + 1;
                      const pasos = [
                        { label: "El problema", texto: p.que_pasa },
                        { label: "Lo que plantea", texto: p.que_propone },
                        { label: "El cambio que busca", texto: p.que_cambia },
                      ];
                      return <article key={p.id} className="border-b border-[#e2e9f8] py-7 last:border-b-0 sm:py-8">
                        <div className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf0ff] text-xs font-semibold text-[#3458d8]">{String(numero).padStart(2, "0")}</span><h4 className="max-w-4xl text-lg font-semibold leading-6 tracking-[-0.02em] text-[#111b3f] sm:text-xl">{p.titulo || "Propuesta sin título"}</h4></div>
                        <div className="mt-5 grid overflow-hidden rounded-[20px] border border-[#e2e9f8] bg-[#fafbff] lg:grid-cols-[0.9fr_1.2fr_0.9fr]">
                          {pasos.map((paso, index) => (
                            <div key={paso.label} className={`p-5 sm:p-6 ${index === 1 ? "border-y border-[#e0d9f5] bg-[#eee9fa] lg:border-x lg:border-y-0" : ""}`}>
                              <p className={`text-[10px] font-bold uppercase tracking-[0.12em] ${index === 1 ? "text-[#6143a5]" : "text-[#52678d]"}`}>{paso.label}</p>
                              <p className={`mt-3 whitespace-pre-line break-words text-sm leading-6 ${index === 1 ? "font-medium text-[#30294e]" : "text-slate-600"}`}>{paso.texto?.trim() || "Sin información registrada en este apartado."}</p>
                            </div>
                          ))}
                        </div>
                      </article>;
                    })}
                    <p className="pb-4 pt-1 text-[11px] leading-5 text-slate-500">El cambio esperado describe lo planteado en la propuesta; su cumplimiento se consulta en seguimiento.</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
        {visibles.length === 0 && <div className="py-10 text-center"><p className="text-sm text-slate-600">{propuestasArray.length === 0 ? "Sin propuestas registradas." : "No hay propuestas que coincidan con esa búsqueda."}</p>{busqueda && <button type="button" onClick={() => setBusqueda("")} className="mt-4 text-sm font-semibold text-[#3458d8]">Ver todas las propuestas</button>}</div>}
      </div>
    </div>
  );
}
