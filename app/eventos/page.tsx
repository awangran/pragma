import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import EventsFilterClient from "@/components/events-filter-client";

async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data && (data as any).user ? (data as any).user : null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;
  return <Navbar user={user ? { avatarUrl } : null} />;
}

export default async function EventosPage() {
  const supabase = await createClient();

  const { data: eventosData } = await supabase
    .from("eventos")
    .select(
      "id, titulo, resumen, descripcion, categoria, fecha_evento, hora, lugar, ciudad, candidato_nombre, partido, inscripcion_url, foto"
    )
    .order("fecha_evento", { ascending: true });

  const eventos = (eventosData ?? []) as Array<{
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
  }>;

  const categories = Array.from(
    new Set(eventos.map((e) => e.categoria).filter(Boolean))
  );

  return (
    <div className="w-full flex flex-col min-h-screen">
      <Suspense fallback={<Navbar user={null} />}>
        <NavbarWithUser />
      </Suspense>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="w-full max-w-6xl">
          <header className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-3">
              Eventos
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Debates, foros, mítines y todos los eventos de la campaña presidencial 2026. Encuentra los próximos eventos y regístrate para participar.
            </p>
          </header>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Próximos eventos
            </h2>
          </div>

          <EventsFilterClient eventos={eventos} categories={categories} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
