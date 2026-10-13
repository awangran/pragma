"use client";
import { useMemo, useState } from "react";
import { ChevronDown, X, Users, Search } from "lucide-react";
import { CANDIDATES, CATEGORIES, TOPICS, type CandidateMeta } from "@/lib/comparacion-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4774ff]";
const accents = ["bg-[#e6eeff] text-[#315bc8]", "bg-[#ede6ff] text-[#714ac6]", "bg-[#dff3f5] text-[#20727c]", "bg-[#fce8ee] text-[#a84066]"];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const known = (value: string | undefined) => value === "Sí" || value === "No";
function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("");
}
function PositionBadge({ value }: { value: string | undefined }) {
  const label = value?.trim() ? value : "Sin información";
  const style = value === "Sí"
    ? "border-[#c8d8ff] bg-[#edf3ff] text-[#244aaf]"
    : value === "No"
      ? "border-slate-200 bg-white text-[#111b3f]"
      : "border-dashed border-slate-300 bg-slate-50 text-slate-600";
  return <span className={cn("inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold", style)}>{label}</span>;
}

const IMAGENES_TEMA: Record<string, string> = {
  "Medio Ambiente": "/tema-medio-ambiente.jpg",
  Economía: "/tema-economia.jpg",
  "Seguridad y Política Exterior": "/tema-seguridad.jpg",
  "Derechos Sociales": "/seguimiento-equidad.jpg",
  Institucional: "/congreso.jpg",
};

export default function ComparacionClient() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0] ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const selectedCandidates = useMemo<CandidateMeta[]>(() => selectedIds.flatMap((id) => { const candidate = CANDIDATES.find((c) => c.id === id); return candidate ? [candidate] : []; }), [selectedIds]);
  const availableCandidates = useMemo(() => CANDIDATES.filter((c) => normalize(c.name).includes(normalize(query))), [query]);
  const allRows = useMemo(() => TOPICS.map((topic) => {
    const answers = selectedCandidates.map((c) => topic.positions[String(c.id)]);
    const evaluable = answers.length >= 2 && answers.every(known);
    const allAgree = evaluable && answers.every((answer) => answer === answers[0]);
    const hasDifference = answers.includes("Sí") && answers.includes("No");
    return { topic, evaluable, allAgree, hasDifference };
  }), [selectedCandidates]);
  const rows = allRows.filter((row) => row.topic.category === activeCategory);
  const generalEvaluable = allRows.filter((row) => row.evaluable).length;
  const generalAgreements = allRows.filter((row) => row.allAgree).length;
  const generalPct = generalEvaluable ? Math.round(generalAgreements / generalEvaluable * 100) : null;
  const evaluableCount = rows.filter((row) => row.evaluable).length;
  const agreementCount = rows.filter((row) => row.allAgree).length;
  const agreementPct = evaluableCount ? Math.round(agreementCount / evaluableCount * 100) : null;
  const visibleRows = rows.filter((row) => !onlyDifferences || row.hasDifference);
  const groupedRows = Array.from(new Set(visibleRows.map((row) => row.topic.category))).map((category) => ({
    category,
    items: visibleRows.filter((row) => row.topic.category === category),
  }));
  const showTable = selectedCandidates.length >= 2;
  function toggleCandidate(id: number) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  }
  return (
    <div className="flex w-full min-w-0 flex-col gap-5 text-[#111b3f]">
      {/* SELECCIÓN */}
      <div className="border-b border-[#dce5fb] pb-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#315bc8]">01 · Candidatos</p>
            <h3 className="mt-1.5 text-base font-semibold tracking-[-0.025em]">Elige a quiénes comparar</h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">Selecciona al menos dos candidatos.</p>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button type="button" className={cn("inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#4774ff] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#244aaf]", focus)}>
                <Users className="h-4 w-4" aria-hidden="true" /> {selectedCandidates.length ? "Cambiar candidatos" : "Elegir candidatos"} <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} aria-hidden="true" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(360px,calc(100vw-32px))] rounded-[18px] border-[#e2e9f8] p-3 shadow-xl" align="start">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
                <input aria-label="Buscar candidatos por nombre" placeholder="Busca un candidato…" value={query} onChange={(event) => setQuery(event.target.value)} className={cn("w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-[#111b3f]", focus)} />
              </div>
              <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
                {availableCandidates.map((c, index) => {
                  const checked = selectedIds.includes(c.id);
                  return (
                    <li key={c.id}>
                      <label htmlFor={`compare-candidate-${c.id}`} className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 transition", checked ? "bg-[#edf3ff]" : "hover:bg-slate-50")}>
                        <Checkbox id={`compare-candidate-${c.id}`} checked={checked} onCheckedChange={() => toggleCandidate(c.id)} aria-label={c.name} />
                        <span aria-hidden="true" className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", accents[index % accents.length])}>{initials(c.name)}</span>
                        <span className="text-xs font-medium leading-5 text-[#111b3f]">{c.name}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {availableCandidates.length === 0 && <p className="px-3 py-5 text-sm text-slate-500">No encontramos candidatos con ese nombre.</p>}
              <button type="button" onClick={() => setOpen(false)} className={cn("mt-3 w-full rounded-full bg-[#4774ff] py-2 text-xs font-semibold text-white hover:bg-[#244aaf]", focus)}>Ver selección ({selectedCandidates.length})</button>
            </PopoverContent>
          </Popover>
        </div>
        {selectedCandidates.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <div className="flex flex-wrap gap-2">
              {selectedCandidates.map((c, index) => (
                <div key={c.id} className="inline-flex items-center gap-2 rounded-full border border-[#e2e9f8] bg-[#f5f8ff] py-1.5 pl-1.5 pr-2">
                  <span aria-hidden="true" className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold", accents[index % accents.length])}>{initials(c.name)}</span>
                  <span className="text-xs font-semibold">{c.name}</span>
                  <button type="button" onClick={() => toggleCandidate(c.id)} aria-label={`Quitar ${c.name}`} className={cn("rounded-full p-1.5 text-slate-500 transition hover:bg-[#e6eeff] hover:text-[#244aaf]", focus)}><X className="h-3.5 w-3.5" aria-hidden="true" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSelectedIds([])} className={cn("mt-3 rounded text-xs font-medium text-[#315bc8] underline underline-offset-4", focus)}>Quitar todos</button>
          </div>
        )}
      </div>
      {/* FILTROS */}
      <div className="border-b border-[#dce5fb] pb-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#315bc8]">02 · Elige un tema</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {CATEGORIES.map((category) => (
            <button type="button" key={category ?? "all"} aria-pressed={activeCategory === category} onClick={() => { setActiveCategory(category); }} className={cn("rounded-full border px-3 py-1.5 text-[11px] font-semibold transition", focus, activeCategory === category ? "border-[#4774ff] bg-[#4774ff] text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-[#9bb6ff] hover:bg-[#edf3ff]")}>
              {category}
            </button>
          ))}
        </div>
      </div>
      {/* La coincidencia describe estas respuestas, no una afinidad general. */}
      {showTable ? (
        <section aria-label="Resumen de coincidencias" className="grid gap-3 sm:grid-cols-2">
        {[
          { label: "Coincidencia entre temas", pct: generalPct, agree: generalAgreements, total: generalEvaluable, scope: "Todos los temas", color: "text-[#7863bd]", bg: "bg-[#f5f1fc]", border: "border-[#e5dcf4]" },
          { label: "Coincidencia en este tema", pct: agreementPct, agree: agreementCount, total: evaluableCount, scope: activeCategory, color: "text-[#5574ff]", bg: "bg-[#f1f5ff]", border: "border-[#dfe7fa]" },
        ].map((metric) => (
          <article key={metric.label} className={cn("rounded-[20px] border p-5", metric.bg, metric.border)}>
            <p className={cn("text-[9px] font-semibold uppercase tracking-[0.16em]", metric.color)}>{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <p className={cn("text-3xl font-semibold leading-none tracking-[-0.04em]", metric.color)}>{metric.pct === null ? "—" : `${metric.pct}%`}</p>
              <p className="text-right text-[11px] text-slate-500">{metric.scope}</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600">{metric.total ? `Coinciden en ${metric.agree} de ${metric.total} preguntas comparables.` : "No hay respuestas suficientes para calcular la coincidencia."}</p>
          </article>
        ))}
        <details className="text-xs leading-5 text-slate-600 sm:col-span-2">
          <summary className={cn("w-fit cursor-pointer font-semibold text-[#7863bd]", focus)}>¿Cómo calculamos la coincidencia?</summary>
          <p className="mt-2 max-w-2xl">El porcentaje muestra en cuántas preguntas coinciden todos los candidatos que elegiste. Solo se incluyen preguntas que todos respondieron con «Sí» o «No».</p>
        </details>
      </section>
    ) : (
        <div role="status" aria-live="polite" className="border-l-2 border-[#a5b8ff] bg-gradient-to-r from-[#edf3ff] to-transparent px-4 py-4">
          <h3 className="text-base font-semibold tracking-[-0.02em]">
            {selectedCandidates.length === 1
              ? "Te falta elegir otro candidato."
              : "Aquí aparecerán las posturas de las candidaturas que elijas."}
          </h3>
          <p className="mt-2 max-w-lg text-xs leading-5 text-slate-600">
            {selectedCandidates.length === 1
              ? "Agrégalo desde «Cambiar candidatos» para empezar a comparar."
              : "Usa «Elegir candidatos» para comenzar."}
          </p>
        </div>
      )}
      {/* RESULTADOS */}
      {showTable && (
        <div className="mt-6 rounded-[22px] border border-[#e2e9f8] bg-white p-4 sm:p-6">
          {/* CABECERA DEL TEMA SELECCIONADO */}
<div className="relative isolate mb-6 overflow-hidden rounded-[18px] bg-[#edf2ff]">
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: `url("${
        IMAGENES_TEMA[activeCategory] ?? "/seguimiento-colombia.jpg"
      }")`,
    }}
  />

  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0"
    style={{
      background:
        "linear-gradient(90deg, rgba(245,247,255,0.98) 0%, rgba(245,247,255,0.92) 32%, rgba(245,247,255,0.48) 58%, rgba(245,247,255,0.05) 82%, transparent 100%)",
    }}
  />

  <div className="relative z-10 flex min-h-[150px] flex-col justify-center gap-5 px-5 py-6 sm:min-h-[170px] sm:flex-row sm:items-center sm:justify-between sm:px-7">
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
        El tema que estás comparando
      </p>

      <h3 className="mt-3 max-w-md text-2xl font-semibold leading-[1.12] tracking-[-0.035em] text-[#111b3f] sm:text-3xl">
        {activeCategory}
      </h3>

      <p
        aria-live="polite"
        className="mt-2 text-xs leading-5 text-slate-600"
      >
        {visibleRows.length} preguntas · {selectedCandidates.length} candidatos
      </p>
    </div>

    <button
      type="button"
      aria-pressed={onlyDifferences}
      onClick={() => setOnlyDifferences((value) => !value)}
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center rounded-full border px-4 py-2.5 text-[11px] font-semibold transition-colors",
        focus,
        onlyDifferences
          ? "border-[#5574ff] bg-[#5574ff] text-white"
          : "border-[#dce3f5] bg-white/95 text-[#3458d8] hover:bg-[#edf2ff]",
      )}
    >
      {onlyDifferences ? "Mostrar todas las respuestas" : "Ver solo diferencias"}
    </button>
  </div>
</div>
          {onlyDifferences && <p className="mb-4 text-xs leading-6 text-slate-500">Muestra preguntas donde hay al menos un «Sí» y un «No» entre los seleccionados.</p>}
          {visibleRows.length === 0 ? <div role="status" className="rounded-[16px] border border-[#dce5fb] bg-white p-5 text-center text-xs leading-6 text-slate-600">{onlyDifferences ? "No hay diferencias registradas en este tema. Prueba otro tema o desactiva el filtro." : "No hay preguntas registradas en este tema."}</div> : (
            <div className="space-y-5">
            {groupedRows.map(({ category, items }) => (
            <section key={category} aria-label={`Comparación sobre ${category}`}>
            <div role="region" aria-label={`Tabla de comparación sobre ${category}`} tabIndex={0} className={cn("overflow-x-auto rounded-[16px] border border-[#dce5fb] bg-white", focus)}>
              <table className="w-full border-collapse text-xs">
                <caption className="sr-only">Posiciones de los candidatos seleccionados en {category}.</caption>
                <thead>
                  <tr className="border-b border-[#e2e9f8] bg-[#f8fafc]">
                    <th scope="col" className="sticky left-0 z-20 min-w-[150px] w-[150px] sm:w-[260px] bg-[#f8fafc] px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-[#315bc8] sm:min-w-[230px] sm:px-4">Pregunta</th>
                    {selectedCandidates.map((c, index) => <th scope="col" key={c.id} className="min-w-[120px] px-3 py-3 text-center"><span aria-hidden="true" className={cn("mx-auto mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", accents[index % accents.length])}>{initials(c.name)}</span><span className="block text-[11px] font-semibold leading-4 text-[#111b3f]">{c.name}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map(({ topic, allAgree, hasDifference }, index) => {
                    const background = hasDifference ? "bg-[#f7f3fc]" : index % 2 === 0 ? "bg-white" : "bg-[#fafbfc]";
                    return (
                      <tr key={topic.id} className={cn("border-b border-slate-100 last:border-0", background)}>
                        <th scope="row" className={cn("sticky left-0 z-10 min-w-[150px] w-[150px] sm:w-[260px] px-3 py-3 text-left font-medium sm:min-w-[230px] sm:px-4", background)}>
                          <span className="block text-xs leading-5 text-[#111b3f]">{topic.question}</span>
                          {hasDifference && <span className="mt-1.5 block text-[9px] font-semibold text-[#714ac6]">Hay posiciones distintas</span>}
                          {allAgree && <span className="mt-1.5 inline-flex items-center gap-1.5 text-[9px] font-semibold text-[#315bc8]"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#4774ff]" />Coinciden</span>}
                        </th>
                        {selectedCandidates.map((c) => <td key={c.id} className="px-3 py-3 text-center"><PositionBadge value={topic.positions[String(c.id)]} /></td>)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </section>
            ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
