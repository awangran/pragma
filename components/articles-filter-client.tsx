"use client";

import { useState } from "react";
import ArticleCard from "@/components/article-card";

interface Article {
  id: number;
  titulo: string;
  resumen: string;
  categoria: string;
  foto?: string;
}

interface ArticlesFilterClientProps {
  articles: Article[];
  categories: string[];
}

export default function ArticlesFilterClient({
  articles,
  categories,
}: ArticlesFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredArticles = activeCategory
    ? articles.filter((a) => a.categoria === activeCategory)
    : articles;

  return (
    <div className="w-full">
      {/* Filter buttons */}
      <div className="flex flex-wrap items-center justify-end gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() =>
              setActiveCategory(activeCategory === cat ? null : cat)
            }
            className={`rounded-full border px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              titulo={article.titulo}
              resumen={article.resumen}
              categoria={article.categoria}
              foto={article.foto}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-12">
          No hay artículos en esta categoría.
        </p>
      )}
    </div>
  );
}
