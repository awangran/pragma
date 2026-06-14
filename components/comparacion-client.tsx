"use client";

import { useMemo, useState } from "react";
import { ChevronDown, X, Users } from "lucide-react";
import { CANDIDATES, CATEGORIES, TOPICS, type CandidateMeta } from "@/lib/comparacion-data";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function PositionBadge({ value }: { value: string | undefined }) {
  if (!value || value === "No sé") {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        No sabe
      </span>
    );
  }
  if (value === "Sí") {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        Sí
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
      No
    </span>
  );
}

function AgreementBar({ pct }: { pct: number }) {
  const color =
    pct >= 70 ? "text-green-700" : pct >= 40 ? "text-amber-600" : "text-red-600";
  const barColor =
    pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-amber-400" : "bg-red-500";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-600">
          Coincidencia entre candidatos seleccionados
        </span>
        <span className={cn("text-2xl font-bold", color)}>{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Porcentaje de preguntas donde todos los candidatos seleccionados tienen la misma posición
      </p>
    </div>
  );
}

export default function ComparacionClient() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const selectedCandidates = useMemo<CandidateMeta[]>(
    () => CANDIDATES.filter((c) => selectedIds.includes(c.id)),
    [selectedIds]
  );

  const filteredTopics = useMemo(
    () => TOPICS.filter((t) => !activeCategory || t.category === activeCategory),
    [activeCategory]
  );

  const agreementPct = useMemo(() => {
    if (selectedIds.length < 2 || filteredTopics.length === 0) return 0;
    const count = filteredTopics.filter((topic) => {
      const answers = selectedCandidates.map((c) => topic.positions[String(c.id)]);
      return answers.every((a) => a === answers[0]);
    }).length;
    return Math.round((count / filteredTopics.length) * 100);
  }, [selectedIds, selectedCandidates, filteredTopics]);

  function toggleCandidate(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function removeCandidate(id: number) {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }

  const showTable = selectedIds.length >= 2;

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Candidate multi-selector */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-slate-700">
          Selecciona candidatos para comparar
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 w-fit"
              aria-haspopup="listbox"
              aria-expanded={open}
            >
              <Users className="h-4 w-4 text-slate-400" aria-hidden />
              {selectedIds.length === 0
                ? "Elegir candidatos"
                : `${selectedIds.length} candidato${selectedIds.length > 1 ? "s" : ""} seleccionado${selectedIds.length > 1 ? "s" : ""}`}
              <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2" align="start">
            <ul className="space-y-1" role="listbox" aria-multiselectable="true">
              {CANDIDATES.map((c) => {
                const checked = selectedIds.includes(c.id);
                return (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-slate-50">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleCandidate(c.id)}
                        id={`candidate-${c.id}`}
                        aria-label={c.name}
                      />
                      <span className="leading-snug">{c.name}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>

        {/* Selected candidates chips */}
        {selectedCandidates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedCandidates.map((c) => (
              <Badge
                key={c.id}
                variant="secondary"
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
              >
                {c.name}
                <button
                  onClick={() => removeCandidate(c.id)}
                  aria-label={`Quitar ${c.name}`}
                  className="ml-0.5 rounded-full hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            activeCategory === null
              ? "bg-pblue text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          Todas
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === cat
                ? "bg-pblue text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agreement indicator */}
      {showTable && <AgreementBar pct={agreementPct} />}

      {/* Table or empty state */}
      {!showTable ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <Users className="mb-4 h-12 w-12 text-slate-300" aria-hidden />
          <p className="text-base font-medium text-slate-500">
            Selecciona al menos 2 candidatos para comparar
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Usa el selector de arriba para elegir los candidatos
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border shadow-sm">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 min-w-[220px] max-w-[320px]">
                  Pregunta
                </th>
                {selectedCandidates.map((c) => (
                  <th
                    key={c.id}
                    className="px-4 py-3 text-center text-xs font-semibold text-slate-700 min-w-[130px] max-w-[180px]"
                  >
                    <span className="leading-snug">{c.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTopics.map((topic, idx) => {
                const answers = selectedCandidates.map((c) => topic.positions[String(c.id)]);
                const allAgree = answers.every((a) => a === answers[0]);
                return (
                  <tr
                    key={topic.id}
                    className={cn(
                      "border-b last:border-0 transition-colors",
                      allAgree ? "bg-green-50" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    )}
                  >
                    <td className="sticky left-0 z-10 px-4 py-3 font-medium text-slate-800 min-w-[220px] max-w-[320px] bg-inherit">
                      <div className="flex items-start gap-2">
                        {allAgree && (
                          <span
                            className="mt-0.5 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-green-400"
                            title="Todos coinciden"
                            aria-label="Todos coinciden"
                          />
                        )}
                        <span className="leading-snug">{topic.question}</span>
                      </div>
                    </td>
                    {selectedCandidates.map((c) => (
                      <td key={c.id} className="px-4 py-3 text-center">
                        <PositionBadge value={topic.positions[String(c.id)]} />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      {showTable && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="font-medium">Leyenda:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            Todos coinciden
          </span>
          <PositionBadge value="Sí" />
          <PositionBadge value="No" />
          <PositionBadge value="No sé" />
        </div>
      )}
    </div>
  );
}
