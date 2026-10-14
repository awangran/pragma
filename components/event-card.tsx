"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, MapPin, ArrowUpRight, Pencil } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";

export interface EventCardProps {
  id: number;
  titulo: string;
  resumen: string;
  descripcion?: string | null;
  categoria: string;
  fecha_evento: string;
  hora?: string | null;
  lugar?: string | null;
  ciudad?: string | null;
  candidato_nombre?: string | null;
  partido?: string | null;
  inscripcion_url?: string | null;
  foto?: string | null;
  isAdmin?: boolean;
}

function urlSegura(valor?: string | null) {
  if (!valor) return null;
  try {
    const url = new URL(valor);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function imagenSegura(valor?: string | null) {
  return valor?.startsWith("/") && !valor.startsWith("//") ? valor : urlSegura(valor);
}
function fechaLegible(valor: string) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(valor ?? "")) return "Fecha por confirmar";
  const fecha = new Date(valor.slice(0, 10) + "T12:00:00Z");
  return Number.isNaN(fecha.getTime()) ? "Fecha por confirmar" :
    new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(fecha);
}

export default function EventCard({
  id, titulo, resumen, descripcion, categoria, fecha_evento, hora,
  lugar, ciudad, candidato_nombre, partido, inscripcion_url, foto, isAdmin = false,
}: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  useEffect(() => setImageError(false), [foto]);
  const imagen = imagenSegura(foto);
  const inscripcion = urlSegura(inscripcion_url);
  const ubicacion = [lugar, ciudad].filter(Boolean).join(" · ");

  return <article className="overflow-hidden rounded-[24px] border border-[#e2e9f8] bg-white text-[#111b3f]">
    {imagen && !imageError && <div className="relative aspect-[16/9] overflow-hidden bg-[#edf2ff]">
      <Image src={imagen} alt="" fill sizes="(max-width: 1024px) 100vw, 560px" unoptimized
        className="object-cover" onError={() => setImageError(true)} />
    </div>}
    <div className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {categoria && <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7863bd]">{categoria}</p>}
          <h3 className="mt-2 text-xl font-semibold leading-7 tracking-[-0.03em]">{titulo}</h3>
        </div>
        <FavoriteButton tipo="evento" recursoId={id} compact />
      </div>
      <div className="mt-4 space-y-2 text-xs leading-6 text-slate-600">
        <p className="flex items-start gap-2"><CalendarDays aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#7863bd]" />
          <span>{fechaLegible(fecha_evento)}{hora ? " · " + hora : ""}</span></p>
        {ubicacion && <p className="flex items-start gap-2"><MapPin aria-hidden className="mt-1 h-4 w-4 shrink-0 text-[#7863bd]" /><span>{ubicacion}</span></p>}
        {candidato_nombre && <p>{candidato_nombre}{partido ? " · " + partido : ""}</p>}
      </div>
      {resumen && <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">{resumen}</p>}
      {descripcion && descripcion.trim() !== (resumen ?? "").trim() && <details className="group mt-4">
        <summary className="w-fit cursor-pointer text-xs font-medium text-[#7863bd]">Más sobre este encuentro</summary>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">{descripcion}</p>
      </details>}
      <div className="mt-5 flex flex-wrap items-center gap-5 border-t border-[#e2e9f8] pt-4">
        {inscripcion ? <a href={inscripcion} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border-b border-[#5574ff]/40 pb-1 text-xs font-semibold text-[#5574ff]">
          Consultar inscripción<ArrowUpRight aria-hidden className="h-3.5 w-3.5" /><span className="sr-only"> (abre en otra pestaña)</span>
        </a> : <p className="text-xs text-slate-500">Sin enlace de inscripción disponible.</p>}
        {isAdmin && <Link href={"/admin/edit-evento/" + id}
          className="inline-flex items-center gap-2 text-xs text-[#7863bd] underline underline-offset-4">
          <Pencil aria-hidden className="h-3.5 w-3.5" />Editar evento
        </Link>}
      </div>
    </div>
  </article>;
}
