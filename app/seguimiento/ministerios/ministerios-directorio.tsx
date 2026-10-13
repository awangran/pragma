"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";

export type MinisterioDirectorio = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  responsable: string | null;
  avatar: string | null;
  cargo: string | null;
};

function normalizar(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function nombreCorto(nombre: string) {
  return nombre.replace(/^Ministerio\s+(?:de\s+|del\s+|para\s+)?/i, "");
}

function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("");
}

export default function MinisteriosDirectorio({
  ministerios,
}: {
  ministerios: MinisterioDirectorio[];
}) {
  const [busqueda, setBusqueda] = useState("");

  const resultados = useMemo(() => {
    const palabras = normalizar(busqueda).trim().split(/\s+/).filter(Boolean);

    return ministerios.filter((m) => {
      const texto = normalizar(`${m.nombre} ${m.responsable ?? ""} ${m.descripcion ?? ""}`);
      return palabras.every((palabra) => texto.includes(palabra));
    });
  }, [busqueda, ministerios]);

  return (
    <section id="directorio" aria-labelledby="directorio-title" className="scroll-mt-24">
      <div className="grid gap-6 pb-7 md:grid-cols-[1fr_0.85fr] md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
            Directorio
          </p>
          <h2
            id="directorio-title"
            className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.035em]"
          >
            Busca por sector o por nombre
          </h2>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
            Escribe un tema, un ministerio o el nombre de quien lo dirige.
          </p>
        </div>

        <div>
          <label htmlFor="buscar-ministerio" className="mb-2 block text-xs font-medium text-[#111b3f]">
            Buscar
          </label>
          <div className="flex items-center gap-3 border-b border-[#a5b8ff] py-3 focus-within:border-[#5574ff]">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-[#5574ff]" />
            <input
              id="buscar-ministerio"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Educación, salud, nombre del ministro…"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#111b3f] outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
                className="rounded p-1 text-slate-500 hover:text-[#5574ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5574ff]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#dfe7f8] py-4 text-[11px] text-slate-500">
        <p role="status" aria-live="polite">
          {resultados.length} {resultados.length === 1 ? "ministerio" : "ministerios"}
          {busqueda ? " encontrados" : ""}
        </p>
        <span>Orden alfabético</span>
      </div>

      {resultados.length ? (
        <ul className="grid gap-x-10 lg:grid-cols-2">
          {resultados.map((m) => (
            <li key={m.id} className="border-b border-[#dfe7f8]">
              <Link
                href={`/seguimiento/ministerios/${m.slug}`}
                className="group flex h-full items-start gap-4 py-7 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff] sm:gap-5 sm:py-8"
              >
                <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#edf2ff] sm:h-44 sm:w-40">
                  {m.avatar ? (
                    <Image
                      src={m.avatar}
                      alt={m.responsable ?? "Ministro o ministra"}
                      fill
                      sizes="(max-width: 640px) 96px, 160px"
                      unoptimized
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-full items-center justify-center text-3xl font-semibold text-[#7863bd]"
                    >
                      {iniciales(m.responsable ?? "")}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold leading-6 tracking-[-0.025em] text-[#111b3f] group-hover:text-[#243d9b]">
                    {nombreCorto(m.nombre)}
                  </h3>

                  {m.descripcion && (
                    <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-600">
                      {m.descripcion}
                    </p>
                  )}

                  <div className="mt-4 border-l-2 border-[#c7b5ff] pl-3 text-xs leading-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7863bd]">
                      A cargo
                    </p>
                    <p className="mt-1 font-medium text-[#111b3f]">
                      {m.responsable ?? "Sin responsable registrado"}
                    </p>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-2 border-b border-[#5574ff]/35 pb-1 text-[11px] font-normal text-[#5574ff] group-hover:border-[#5574ff]">
                    Consultar perfil
                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border-b border-[#dfe7f8] py-12">
          <p className="text-lg font-medium">
            {ministerios.length ? "No encontramos coincidencias." : "Todavía no hay ministerios disponibles."}
          </p>
          {ministerios.length > 0 && (
            <>
              <p className="mt-2 text-sm text-slate-600">
                Prueba con otro nombre o con un tema más general.
              </p>
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="mt-5 border-b border-[#5574ff]/40 pb-1 text-sm text-[#5574ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
              >
                Ver todos los ministerios
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}