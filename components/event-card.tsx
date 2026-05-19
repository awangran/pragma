"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Calendar, Clock, MapPin, User, ExternalLink, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EventCardProps {
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
  isAdmin?: boolean;
}

const CATEGORY_THEME: Record<string, { bg: string; text: string; border: string }> = {
  "Debate":          { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-200" },
  "Mitin":           { bg: "bg-violet-50",  text: "text-violet-600",  border: "border-violet-200" },
  "Foro":            { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  "Lanzamiento":     { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200" },
  "Rueda de prensa": { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-200" },
};

const DEFAULT_THEME = { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" };

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function EventCard({
  id,
  titulo,
  resumen,
  descripcion,
  categoria,
  fecha_evento,
  hora,
  lugar,
  ciudad,
  candidato_nombre,
  partido,
  inscripcion_url,
  foto,
  isAdmin,
}: EventCardProps) {
  const [imageError, setImageError] = useState(false);
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const theme = CATEGORY_THEME[categoria] ?? DEFAULT_THEME;
  const formattedDate = formatDate(fecha_evento);

  async function handleDelete() {
    if (!window.confirm("¿Seguro que quieres eliminar este evento? Esta acción no se puede deshacer.")) return;
    setIsDeleting(true);
    const supabase = createClient();
    await supabase.from("eventos").delete().eq("id", id);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-violet-200 via-purple-300 to-indigo-300">
          {foto && !imageError ? (
            <Image
              src={foto}
              alt={titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-200 via-purple-300 to-indigo-300" />
          )}
          {/* Category badge over image */}
          <span className={`absolute top-3 left-3 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${theme.bg} ${theme.text} ${theme.border}`}>
            {categoria}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 p-4 flex-1">
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="capitalize">{formattedDate}</span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {titulo}
          </h3>

          {/* Summary */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 flex-1">
            {resumen}
          </p>

          {/* Candidate / party */}
          {(candidato_nombre || partido) && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {candidato_nombre ?? partido}
              </span>
            </div>
          )}

          {/* Open dialog */}
          <DialogTrigger asChild>
            <button
              type="button"
              className="mt-2 text-xs sm:text-sm font-medium text-blue-600 hover:underline text-left"
            >
              Ver más →
            </button>
          </DialogTrigger>
        </div>
      </div>

      {/* Dialog */}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Featured image */}
        {foto && !imageError && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-1 -mt-2">
            <Image src={foto} alt={titulo} fill className="object-cover" />
          </div>
        )}

        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${theme.bg} ${theme.text} ${theme.border}`}>
              {categoria}
            </span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mt-1">
            {titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {/* Date & time */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <span className="capitalize font-medium">{formattedDate}</span>
            </div>
            {hora && (
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                <span>{hora}</span>
              </div>
            )}
          </div>

          {/* Location */}
          {(lugar || ciudad) && (
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" aria-hidden />
              <span>
                {[lugar, ciudad].filter(Boolean).join(" — ")}
              </span>
            </div>
          )}

          {/* Candidate / party */}
          {(candidato_nombre || partido) && (
            <div className="flex items-start gap-2 text-slate-600">
              <User className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" aria-hidden />
              <div className="flex flex-col gap-0.5">
                {candidato_nombre && <span className="font-medium">{candidato_nombre}</span>}
                {partido && <span className="text-slate-500 text-xs">{partido}</span>}
              </div>
            </div>
          )}

          {/* Full description */}
          {descripcion && (
            <div className="border-t border-slate-100 pt-3">
              {descripcion.split("\n\n").map((p, i) => (
                <p key={i} className="text-slate-700 leading-relaxed mb-2 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center gap-2">
            {inscripcion_url && (
              <a
                href={inscripcion_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-pblue px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Inscribirse
              </a>
            )}

            {isAdmin && (
              <>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5" asChild>
                  <Link href={`/admin/edit-evento/${id}`}>
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                    Editar
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-xl gap-1.5"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  {isDeleting ? "Eliminando…" : "Eliminar"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
