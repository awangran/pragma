"use client";

import { useMemo, useState } from "react";
import type { Candidate } from "@/types/candidates";
import type { Tema } from "@/types/tema";

import CandidateCard from "@/components/candidate-card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown } from "lucide-react";

type Props = {
  candidates: Candidate[];
  temas: Tema[];
};

export default function CandidatesFilterClient({ candidates, temas }: Props) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(null);

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const c of candidates as any[]) {
      const r = c.ubicacion;
      if (r && typeof r === "string") set.add(r);
    }
    return Array.from(set).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (candidates ?? []).filter((c: any) => {
      const matchesQuery = !q
        || c.nombre?.toLowerCase().includes(q)
        || c.cargo?.toLowerCase().includes(q)
        || c.partido?.toLowerCase().includes(q);
      const candidateRegion = c.ubicacion;
      const matchesRegion = !region || candidateRegion === region;
      return matchesQuery && matchesRegion;
    });
  }, [candidates, query, region]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, cargo o partido..."
            className="h-11 rounded-xl bg-slate-50 pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-11 rounded-xl bg-slate-50 px-4 text-sm font-medium text-slate-800 shadow-sm inline-flex items-center gap-2">
                {region ?? "Todas las regiones"}
                <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setRegion(null)}>Todas las regiones</DropdownMenuItem>
              {regions.map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRegion(r)}>
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <p className="text-sm text-slate-700">Mostrando {filtered.length} resultados</p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filtered.map((candidate: any, index: number) => (
          <CandidateCard
            key={candidate.id ?? candidate.nombre ?? index}
            id={candidate.id ?? index}
            nombre={candidate.nombre}
            cargo={candidate.cargo}
            partido={candidate.partido}
            avatar={candidate.avatar}
            ubicacion={candidate.ubicacion}
          />
        ))}
      </div>
    </div>
  );
}
