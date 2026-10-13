"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Search, X } from "lucide-react";

interface Article {
  id: number;
  titulo: string;
  resumen: string;
  categoria: string;
  foto?: string | null;
  created_at?: string | null;
}

interface ArticlesFilterClientProps {
  articles: Article[];
  categories: string[];
}

const CANTIDAD_INICIAL = 4;

const foco =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function fechaPublicacion(value?: string | null) {
  if (!value) return null;

  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) return null;

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Bogota",
  }).format(fecha);
}

function FotoArticulo({
  src,
  principal = false,
}: {
  src?: string | null;
  principal?: boolean;
}) {
  const [fallo, setFallo] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#e8e3ff] via-[#edf0ff] to-[#dceff8]">
      {src && !fallo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading={principal ? "eager" : "lazy"}
          onError={() => setFallo(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full items-center justify-center"
        >
          <BookOpen
            className="h-12 w-12 text-[#9681ce]/40"
            strokeWidth={1.2}
          />
        </div>
      )}
    </div>
  );
}

function Fecha({
  article,
  clara = false,
}: {
  article: Article;
  clara?: boolean;
}) {
  const fecha = fechaPublicacion(article.created_at);

  if (!fecha) return null;

  return (
    <time
      dateTime={article.created_at ?? undefined}
      className={`text-[11px] leading-5 ${
        clara ? "text-white/85" : "text-slate-500"
      }`}
    >
      {fecha}
    </time>
  );
}

function ArticuloPrincipal({ article }: { article: Article }) {
  return (
    <article className="h-full">
      <Link
        href={`/articulos/${article.id}`}
        className={`group relative isolate flex min-h-[380px] h-full items-end overflow-hidden rounded-[28px] bg-[#111b3f] sm:min-h-[440px] lg:min-h-[540px] ${foco}`}
      >
        <FotoArticulo
          key={`${article.id}-${article.foto ?? "sin-foto"}`}
          src={article.foto}
          principal
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(17,27,63,0.02) 15%, rgba(17,27,63,0.24) 45%, rgba(17,27,63,0.86) 100%)",
          }}
        />

        <div className="relative z-10 w-full p-6 sm:p-8 lg:p-9">
          {article.categoria && normalizar(article.categoria) !== "articulos" && <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            {article.categoria}
          </span>}

          <h3 className="mt-4 max-w-2xl text-2xl font-semibold leading-[1.13] tracking-[-0.035em] text-white sm:text-3xl lg:text-[36px]">
            {article.titulo || "Publicación sin título"}
          </h3>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Fecha article={article} clara />

            <span className="inline-flex items-center gap-2 text-xs font-semibold text-white">
              <ArrowUpRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
              />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function ArticuloCompacto({ article }: { article: Article }) {
  return (
    <article className="h-full">
      <Link
        href={`/articulos/${article.id}`}
        className={`group relative isolate flex h-full min-h-[165px] overflow-hidden rounded-[24px] bg-[#eeeaff] ${foco}`}
      >
        <FotoArticulo
          key={`${article.id}-${article.foto ?? "sin-foto"}`}
          src={article.foto}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(241,237,255,0.97) 0%, rgba(240,240,255,0.94) 50%, rgba(219,240,250,0.86) 100%)",
          }}
        />

        <div className="relative z-10 flex w-full flex-col justify-center p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            {article.categoria && normalizar(article.categoria) !== "articulos" && <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7863bd]">
              {article.categoria}
            </p>}

            <Fecha article={article} />
          </div>

          <h3 className="mt-3 line-clamp-3 text-lg font-semibold leading-6 tracking-[-0.025em] text-[#111b3f] transition-colors group-hover:text-[#7863bd]">
            {article.titulo || "Publicación sin título"}
          </h3>

          <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#5574ff]">
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}

function ArticuloFila({ article }: { article: Article }) {
  return (
    <article className="border-b border-[#e2e9f8]">
      <Link
        href={`/articulos/${article.id}`}
        className={`group grid grid-cols-[90px_1fr] items-start gap-4 py-6 sm:grid-cols-[150px_1fr] sm:gap-6 ${foco}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[#eeeaff]">
          <FotoArticulo
            key={`${article.id}-${article.foto ?? "sin-foto"}`}
            src={article.foto}
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {article.categoria && normalizar(article.categoria) !== "articulos" && <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7863bd]">
              {article.categoria}
            </p>}

            <Fecha article={article} />
          </div>

          <h3 className="mt-2 text-base font-semibold leading-6 tracking-[-0.025em] text-[#111b3f] transition-colors group-hover:text-[#5574ff] sm:text-lg">
            {article.titulo || "Publicación sin título"}
          </h3>

          {article.resumen && normalizar(article.resumen.trim()) !== normalizar(article.titulo.trim()) && (
            <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-600">
              {article.resumen}
            </p>
          )}

          <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#5574ff]">
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </article>
  );
}

export default function ArticlesFilterClient({
  articles,
  categories,
}: ArticlesFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [limite, setLimite] = useState(CANTIDAD_INICIAL);

  const query = normalizar(busqueda.trim());

  const categorias = Array.from(
    new Set(
      [...categories, ...articles.map((article) => article.categoria)].filter(
        Boolean,
      ),
    ),
  );

  const filtrados = articles.filter((article) => {
    const coincideCategoria =
      !activeCategory || article.categoria === activeCategory;

    const coincideBusqueda =
      !query ||
      normalizar(
        `${article.titulo ?? ""} ${article.resumen ?? ""} ${
          article.categoria ?? ""
        }`,
      ).includes(query);

    return coincideCategoria && coincideBusqueda;
  });

  const visibles = filtrados.slice(0, limite);
  const principal = visibles[0];
  const secundarios = visibles.slice(1, CANTIDAD_INICIAL);
  const adicionales = visibles.slice(CANTIDAD_INICIAL);

  const hayFiltros = Boolean(activeCategory || query);
  const quedanArticulos = filtrados.length > limite;

  function limpiarFiltros() {
    setActiveCategory(null);
    setBusqueda("");
    setLimite(CANTIDAD_INICIAL);
  }

  return (
    <div className="w-full">
      {/* FILTROS Y BUSCADOR */}
      <div className="border-y border-[#e2e9f8] py-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filtrar artículos por categoría"
            className="flex flex-wrap gap-x-5 gap-y-3"
          >
            {[null, ...categorias].map((categoria) => (
              <button
                key={
                  categoria === null ? "todas" : `categoria-${categoria}`
                }
                type="button"
                aria-pressed={activeCategory === categoria}
                onClick={() => {
                  setActiveCategory(categoria);
                  setLimite(CANTIDAD_INICIAL);
                }}
                className={`border-b-2 pb-1 text-xs transition-colors ${foco} ${
                  activeCategory === categoria
                    ? "border-[#5574ff] font-semibold text-[#5574ff]"
                    : "border-transparent text-slate-500 hover:text-[#5574ff]"
                }`}
              >
                {categoria ?? "Todas"}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72 lg:shrink-0">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500"
            />

            <input
              type="search"
              aria-label="Buscar artículos por título, resumen o categoría"
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value);
                setLimite(CANTIDAD_INICIAL);
              }}
              placeholder="Busca un tema o una palabra"
              className="h-11 w-full rounded-full border border-[#e0e6f5] bg-[#f7f9ff] pl-11 pr-10 text-sm text-[#111b3f] placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#5574ff]"
            />

            {busqueda && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setBusqueda("");
                  setLimite(CANTIDAD_INICIAL);
                }}
                className={`absolute right-2 top-2 rounded-full p-1.5 text-slate-500 ${foco}`}
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONTADOR */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          aria-live="polite"
          className="text-[11px] text-slate-500"
        >
          {filtrados.length} {filtrados.length === 1 ? "lectura" : "lecturas"}
          {hayFiltros ? " encontradas" : ""}
        </p>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className={`text-xs font-semibold text-[#5574ff] hover:underline ${foco}`}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {principal ? (
        <>
          {/* UN PROTAGONISTA + TRES LECTURAS */}
          <div
            className={`mt-7 grid gap-5 ${
              secundarios.length > 0
                ? "lg:grid-cols-[1.7fr_1fr]"
                : ""
            }`}
          >
            <ArticuloPrincipal article={principal} />

            {secundarios.length > 0 && (
              <div className="grid gap-4">
                {secundarios.map((article) => (
                  <ArticuloCompacto key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>

          {/* LAS LECTURAS ADICIONALES APARECEN EN FILAS */}
          {adicionales.length > 0 && (
            <div className="mt-9 border-t border-[#e2e9f8]">
              {adicionales.map((article) => (
                <ArticuloFila key={article.id} article={article} />
              ))}
            </div>
          )}

          {/* EXPANDIR Y REDUCIR */}
          {(quedanArticulos || limite > CANTIDAD_INICIAL) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-[#e2e9f8] pt-6">
              {quedanArticulos && (
                <button
                  type="button"
                  onClick={() =>
                    setLimite((cantidad) => cantidad + CANTIDAD_INICIAL)
                  }
                  className={`inline-flex items-center gap-2 text-sm font-semibold text-[#5574ff] transition-colors hover:text-[#7863bd] ${foco}`}
                >
                  Ver más artículos
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </button>
              )}

              {limite > CANTIDAD_INICIAL && (
                <button
                  type="button"
                  onClick={() => setLimite(CANTIDAD_INICIAL)}
                  className={`text-xs font-semibold text-[#7863bd] hover:underline ${foco}`}
                >
                  Mostrar menos
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        /* ESTADO VACÍO */
        <div className="border-b border-[#e2e9f8] py-14 text-center">
          <BookOpen
            aria-hidden="true"
            className="mx-auto h-8 w-8 text-[#9681ce]"
            strokeWidth={1.5}
          />

          <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-[#111b3f]">
            {hayFiltros
              ? "No encontramos artículos con esos filtros."
              : "Pronto encontrarás nuevas lecturas."}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {hayFiltros
              ? "Prueba con otra palabra o explora todas las categorías."
              : "Aquí podrás explorar análisis sobre los temas del país."}
          </p>

          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className={`mt-5 text-xs font-semibold text-[#5574ff] hover:underline ${foco}`}
            >
              Ver todas las lecturas
            </button>
          )}
        </div>
      )}
    </div>
  );
}