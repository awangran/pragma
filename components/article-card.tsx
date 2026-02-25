"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface ArticleCardProps {
  id: number;
  titulo: string;
  resumen: string;
  categoria: string;
  foto?: string;
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

  return (
    <Link
      href={slug}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-indigo-200 via-blue-300 to-violet-300">
        {foto && !imageError ? (
          <Image
            src={foto}
            alt={titulo}
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
        <span
          className={`text-[11px] sm:text-xs font-medium ${theme.text}`}
        >
          {categoria}
        </span>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {titulo}
        </h3>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
          {resumen}
        </p>

        {/* Read more */}
        <span className="mt-2 text-xs sm:text-sm font-medium text-blue-600 group-hover:underline">
          Leer más
        </span>
      </div>
    </Link>
  );
}
