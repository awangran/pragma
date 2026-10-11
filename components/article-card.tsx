"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface ArticleCardProps {
  id: number;
  titulo: string;
  resumen: string;
  categoria: string;
  foto?: string | null;
}

const CATEGORY_THEME: Record<string, { bg: string; text: string }> = {
  "Elecciones Presidenciales": { bg: "bg-blue-50", text: "text-blue-600" },
  "Elecciones": { bg: "bg-blue-50", text: "text-blue-600" },
  "Guías": { bg: "bg-emerald-50", text: "text-emerald-600" },
  "Artículos": { bg: "bg-violet-50", text: "text-violet-600" },
  "Candidatos": { bg: "bg-amber-50", text: "text-amber-600" },
};

const DEFAULT_THEME = { bg: "bg-slate-100", text: "text-slate-600" };

const getCategoryTheme = (category: string) =>
  CATEGORY_THEME[category] ?? DEFAULT_THEME;

export default function ArticleCard({
  id,
  titulo,
  resumen,
  categoria,
  foto,
}: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);
  const theme = getCategoryTheme(categoria);
  const slug = `/articulos/${id}`;
  const normalizar = (texto: string) => texto.trim().toLocaleLowerCase("es-CO");
  const mostrarCategoria = Boolean(categoria) && normalizar(categoria) !== "artículos";
  const mostrarResumen = Boolean(resumen) && normalizar(resumen) !== normalizar(titulo);

  return (
    <Link
      href={slug}
      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#dfe7f8] bg-white transition-colors hover:border-[#a5b8ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-indigo-200 via-blue-300 to-violet-300">
        {foto && !imageError ? (
          <Image
            src={foto}
            alt=""
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-blue-300 to-violet-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        {/* Category */}
        {mostrarCategoria && (
          <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.text}`}>
            {categoria}
          </span>
        )}

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-[#111b3f] line-clamp-2 group-hover:text-[#5574ff] transition-colors">
          {titulo}
        </h3>

        {/* Summary */}
        {mostrarResumen && (
          <p className="line-clamp-2 text-xs leading-6 text-slate-600 sm:text-sm">{resumen}</p>
        )}
      </div>
    </Link>
  );
}
