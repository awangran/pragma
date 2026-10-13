"use client";

import { useMemo, useState } from "react";
export type ElectoralCandidate = {
  id: number;
  nombre: string | null;
  cargo: string | null;
  partido: string | null;
  avatar: string | null;
  ubicacion: string | null;
  tipo: string | null;
  anio_eleccion: number | null;
  ciudad_eleccion: string | null;
};
const CIUDADES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Santa Marta", "Bucaramanga", "Quibdó", "Riohacha"];
const normalize = (value: string | null | undefined) => (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
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
  candidates: ElectoralCandidate[];
  electionMode?: "local" | "presidential";
  temas: Tema[];
};

export default function CandidatesFilterClient({ candidates, electionMode = "presidential" }: Props) {
  const isLocal = electionMode === "local";
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<string | null>(isLocal ? "Bogotá" : null);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return (candidates ?? []).filter((c) => {
      const matchesQuery = !q
        || normalize(c.nombre).includes(q)
        || normalize(c.cargo).includes(q)
        || normalize(c.partido).includes(q);
      const matchesRegion = !isLocal || !region || normalize(c.ciudad_eleccion) === normalize(region);
      return matchesQuery && matchesRegion;
    });
  }, [candidates, query, region, isLocal]);

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
        {isLocal && (
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-11 rounded-xl bg-slate-50 px-4 text-sm font-medium text-slate-800 shadow-sm inline-flex items-center gap-2">
                {region ?? "Todas las ciudades"}
                <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setRegion(null)}>Todas las ciudades</DropdownMenuItem>
              {CIUDADES.map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRegion(r)}>
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        )}
      </div>

      <p className="text-sm text-slate-700">Mostrando {filtered.length} resultados</p>

      {filtered.length === 0 && (
        <div className="border-t border-[#e2e9f8] py-8">
          <p className="text-sm font-semibold text-[#111b3f]">{isLocal && !query.trim() ? `Próximamente: candidaturas${region ? ` de ${region}` : " locales de 2027"}.` : "No encontramos perfiles con esos filtros."}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{isLocal && !query.trim() ? "Publicaremos los perfiles y sus propuestas a medida que estén disponibles." : "Prueba con otro nombre o cambia el filtro."}</p>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filtered.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            id={candidate.id}
            nombre={candidate.nombre ?? ""}
            cargo={candidate.cargo ?? ""}
            partido={candidate.partido ?? ""}
            avatar={candidate.avatar ?? ""}
            ubicacion={(isLocal ? candidate.ciudad_eleccion ?? candidate.ubicacion : candidate.ubicacion) ?? ""}
          />
        ))}
      </div>
    </div>
  );
}
