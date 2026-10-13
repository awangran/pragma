"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import EventCard from "@/components/event-card";

interface Evento {
  id: number;
  titulo: string;
  resumen: string;
  descripcion?: string;
  categoria: string;
  fecha_evento: string;
  hora?: string;
  lugar?: string;
  ciudad?: string;
  candidato_nombre?: string;
  partido?: string;
  inscripcion_url?: string;
  foto?: string;
}

interface EventsFilterClientProps {
  eventos: Evento[];
  categories: string[];
  hoy: string;
}

export default function EventsFilterClient({ eventos, categories, hoy }: EventsFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<"proximos" | "anteriores">("proximos");
  const [visibleCount, setVisibleCount] = useState(4);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      setIsAdmin(profileData?.role === "admin");
    };
    void checkRole();
  }, []);

  const tieneFecha = (evento: Evento) => /^\d{4}-\d{2}-\d{2}/.test(evento.fecha_evento ?? "") && !Number.isNaN(new Date(`${evento.fecha_evento.slice(0, 10)}T12:00:00Z`).getTime());
  const filteredEventos = eventos
    .filter((evento) => (!activeCategory || evento.categoria === activeCategory) && tieneFecha(evento) && (periodo === "proximos" ? evento.fecha_evento.slice(0, 10) >= hoy : evento.fecha_evento.slice(0, 10) < hoy))
    .sort((a, b) => periodo === "proximos" ? a.fecha_evento.localeCompare(b.fecha_evento) : b.fecha_evento.localeCompare(a.fecha_evento));
  const [primero, ...resto] = filteredEventos.slice(0, visibleCount);
  const fecha = (value: string, formato: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-CO", { ...formato, timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
  const ficha = (evento: Evento) => <EventCard key={evento.id} {...evento} isAdmin={isAdmin} />;

  return (
    <div className="w-full">
      <div role="group" aria-label="Elegir periodo de la agenda" className="mb-5 flex gap-6 border-b border-[#e2e9f8]">
        {(["proximos", "anteriores"] as const).map((opcion) => <button key={opcion} type="button" aria-pressed={periodo === opcion} onClick={() => { setPeriodo(opcion); setVisibleCount(4); }} className={`border-b-2 pb-3 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7863bd] ${periodo === opcion ? "border-[#a68bcf] text-[#7863bd]" : "border-transparent text-slate-500 hover:text-[#111b3f]"}`}>{opcion === "proximos" ? "Próximos encuentros" : "Encuentros anteriores"}</button>)}
      </div>
      <div className="mb-6 flex flex-col gap-4 border-y border-[#e2e9f8] py-4 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Filtrar eventos por categoría" className="flex flex-wrap gap-2">
          {[null, ...Array.from(new Set(categories.filter(Boolean)))].map((cat) => (
            <button
              key={cat ?? "todos"}
              type="button"
              aria-pressed={activeCategory === cat}
              onClick={() => { setActiveCategory(cat); setVisibleCount(4); }}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7863bd] ${activeCategory === cat ? "border-[#d7cbea] bg-[#eee7fa] text-[#655099]" : "border-[#e0e5f2] bg-white text-slate-600 hover:bg-[#f6f2fc]"}`}
            >
              {cat ?? "Todos los encuentros"}
            </button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="shrink-0 text-xs text-slate-500">{filteredEventos.length} {filteredEventos.length === 1 ? "evento" : "eventos"}</p>
      </div>

      {primero ? (
        <div className="grid items-start gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-9">
          <div id={`evento-${primero.id}`} className="min-w-0 scroll-mt-24">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7863bd]">{periodo === "proximos" ? "El primer encuentro de tu selección" : "El encuentro más reciente"}</p>
            {ficha(primero)}
          </div>
          <div className="min-w-0">
            {resto.length > 0 && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5574ff]">Más en la agenda</p>}
            <div className="divide-y divide-[#e2e9f8] border-y border-[#e2e9f8]">
              {resto.map((evento) => (
                <details key={evento.id} id={`evento-${evento.id}`} className="group/evento scroll-mt-24">
                  <summary className="flex cursor-pointer list-none items-start gap-4 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7863bd] [&::-webkit-details-marker]:hidden">
                    <div aria-hidden="true" className="flex w-14 shrink-0 flex-col items-center rounded-[16px] bg-[#f1ebfa] px-2 py-3 text-[#7863bd]">
                      <span className="text-2xl font-semibold leading-none">{fecha(evento.fecha_evento, { day: "2-digit" })}</span>
                      <span className="mt-2 text-[9px] font-semibold uppercase tracking-[0.12em]">{fecha(evento.fecha_evento, { month: "short" })}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {evento.categoria && <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7863bd]">{evento.categoria}</p>}
                      <h3 className="mt-1 text-base font-semibold leading-6 tracking-[-0.02em] text-[#111b3f]">{evento.titulo}</h3>
                      <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-600"><CalendarDays aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{fecha(evento.fecha_evento, { day: "numeric", month: "long", year: "numeric" })}{evento.hora ? ` · ${evento.hora}` : ""}</span></p>
                      {(evento.lugar || evento.ciudad) && <p className="mt-1 flex items-start gap-2 text-xs leading-5 text-slate-600"><MapPin aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{[evento.lugar, evento.ciudad].filter(Boolean).join(" · ")}</span></p>}
                      <span className="mt-3 inline-block text-[11px] font-semibold text-[#5574ff]">Detalles e inscripción</span>
                    </div>
                    <ChevronDown aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#7863bd] transition-transform group-open/evento:rotate-180" />
                  </summary>
                  <div className="pb-5">{ficha(evento)}</div>
                </details>
              ))}
            </div>
            {resto.length === 0 && <p className="border-l-2 border-[#c3b2e1] pl-4 text-sm leading-7 text-slate-600">Cada encuentro es una oportunidad para escuchar una perspectiva distinta. Consulta la ficha para conocer sus detalles.</p>}
          </div>
        </div>
      ) : (
        <div role="status" className="border-b border-[#e2e9f8] py-10">
          <p className="text-base font-semibold text-[#111b3f]">{periodo === "proximos" ? "No hay próximos encuentros para esta selección." : "No hay encuentros anteriores para esta selección."}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Prueba otra categoría o cambia el periodo de la agenda.</p>
          {activeCategory && <button type="button" onClick={() => { setActiveCategory(null); setVisibleCount(4); }} className="mt-4 text-xs font-semibold text-[#7863bd] hover:underline">Quitar filtro de categoría</button>}
        </div>
      )}
      {filteredEventos.length > 4 && (
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-[#e2e9f8] pt-5">
          <p className="text-xs text-slate-500">Mostrando {Math.min(visibleCount, filteredEventos.length)} de {filteredEventos.length} eventos</p>
          <div className="flex items-center gap-4">
            {visibleCount > 4 && <button type="button" onClick={() => setVisibleCount(4)} className="text-xs font-semibold text-[#7863bd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7863bd]">Ver menos</button>}
            {visibleCount < filteredEventos.length && <button type="button" onClick={() => setVisibleCount((count) => count + 4)} className="rounded-full border border-[#d7cbea] bg-[#f3edfc] px-5 py-2.5 text-xs font-semibold text-[#655099] transition-colors hover:bg-[#eae0f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7863bd]">Ver más encuentros</button>}
          </div>
        </div>
      )}
    </div>
  );
}
