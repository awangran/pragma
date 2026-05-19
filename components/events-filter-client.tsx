"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import EventCard from "@/components/event-card";

interface Evento {
  id: number;
  titulo: string;
  resumen: string;
  descripcion?: string;
  categoria: string;
  fecha_evento: string;
  hora?: string;
  lugar?: string;
  ciudad?: string;
  candidato_nombre?: string;
  partido?: string;
  inscripcion_url?: string;
  foto?: string;
}

interface EventsFilterClientProps {
  eventos: Evento[];
  categories: string[];
}

export default function EventsFilterClient({ eventos, categories }: EventsFilterClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      setIsAdmin(profileData?.role === "admin");
    };
    void checkRole();
  }, []);

  const filteredEventos = activeCategory
    ? eventos.filter((e) => e.categoria === activeCategory)
    : eventos;

  return (
    <div className="w-full">
      {/* Filter buttons */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-end gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
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
      )}

      {/* Events grid */}
      {filteredEventos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEventos.map((evento) => (
            <EventCard
              key={evento.id}
              id={evento.id}
              titulo={evento.titulo}
              resumen={evento.resumen}
              descripcion={evento.descripcion}
              categoria={evento.categoria}
              fecha_evento={evento.fecha_evento}
              hora={evento.hora}
              lugar={evento.lugar}
              ciudad={evento.ciudad}
              candidato_nombre={evento.candidato_nombre}
              partido={evento.partido}
              inscripcion_url={evento.inscripcion_url}
              foto={evento.foto}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-12">
          No hay eventos en esta categoría.
        </p>
      )}
    </div>
  );
}
