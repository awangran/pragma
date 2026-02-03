"use client";

import { useMemo, useState } from "react";
import type { Candidate } from "@/types/candidates";
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
};

export default function CandidatesFilterClient({ candidates }: Props) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);

  const topics = useMemo(() => {
    const set = new Set<string>();
    for (const c of candidates) {
      for (const p of c.propuestas ?? []) {
        if (p.topic) set.add(p.topic);
      }
    }
    return Array.from(set).sort();
  }, [candidates]);

  const regions = useMemo(() => {
    const set = new Set<string>();
    for (const c of candidates as any[]) {
      const r = c.location ?? c.region ?? c.ubicacion;
      if (r && typeof r === "string") set.add(r);
    }
    return Array.from(set).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (candidates ?? []).filter((c: any) => {
      const matchesQuery = !q
        || c.name?.toLowerCase().includes(q)
        || c.subtitle?.toLowerCase().includes(q)
        || c.party?.toLowerCase().includes(q);
      const matchesTopic = !topic
        || (c.propuestas ?? []).some((p: any) => p?.topic === topic);
      const candidateRegion = c.location ?? c.region ?? c.ubicacion;
      const matchesRegion = !region || candidateRegion === region;
      return matchesQuery && matchesTopic && matchesRegion;
    });
  }, [candidates, query, topic, region]);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o cargo..."
            className="h-11 rounded-xl bg-slate-50 pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-11 rounded-xl bg-slate-50 px-4 text-sm font-medium text-slate-800 shadow-sm inline-flex items-center gap-2">
                {topic ?? "Todos los temas"}
                <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setTopic(null)}>Todos los temas</DropdownMenuItem>
              {topics.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTopic(t)}>
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

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
        {filtered.map((candidate: any) => (
          <CandidateCard
            key={candidate.id}
            id={candidate.id}
            name={candidate.name}
            subtitle={candidate.subtitle}
            party={candidate.party}
            profileLink={candidate.profileLink}
            avatarUrl={candidate.avatarUrl}
            location={candidate.location ?? candidate.region ?? candidate.ubicacion}
          />
        ))}
      </div>
    </div>
  );
}
