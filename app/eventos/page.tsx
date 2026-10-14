import { FavoriteButton } from "@/components/favorite-button";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Ear,
  Users,
  Lightbulb,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import EventsFilterClient from "@/components/events-filter-client";

async function NavbarWithUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  const user = data?.user ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  return <Navbar user={user ? { avatarUrl } : null} />;
}

type Evento = {
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
};

export default async function EventosPage() {
  const supabase = await createClient();

  const { data: eventosData, error } = await supabase
    .from("eventos")
    .select(
      "id, titulo, resumen, descripcion, categoria, fecha_evento, hora, lugar, ciudad, candidato_nombre, partido, inscripcion_url, foto"
    )
    .order("fecha_evento", { ascending: true });

  if (error) console.error("Error cargando eventos:", error);

  const eventos = (eventosData ?? []) as Evento[];

  const hoy = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Bogota",
  }).format(new Date());

  const proximos = eventos.filter(
    (evento) =>
      /^\d{4}-\d{2}-\d{2}/.test(evento.fecha_evento ?? "") &&
      !Number.isNaN(
        new Date(
          `${evento.fecha_evento.slice(0, 10)}T12:00:00Z`
        ).getTime()
      ) &&
      evento.fecha_evento.slice(0, 10) >= hoy
  );

  const destacado = proximos[0] ?? null;

  const fechaDestacada = destacado
    ? new Intl.DateTimeFormat("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(
        new Date(`${destacado.fecha_evento.slice(0, 10)}T12:00:00Z`)
      )
    : null;

  const categories = Array.from(
    new Set(
      eventos
        .map((evento) => evento.categoria)
        .filter(Boolean)
    )
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-white text-[#111b3f]">
      <main className="flex flex-1 flex-col items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<Navbar user={null} />}>
            <NavbarWithUser />
          </Suspense>
        </div>

        {/* PORTADA */}
        <section
          aria-labelledby="eventos-title"
          className="relative isolate mt-5 w-full overflow-hidden bg-[#111b3f]"
        >
          <Image
            src="/jovenes_hablando.jpeg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "center 85%" }}
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-[#111b3f]/90 via-[#111b3f]/60 to-[#111b3f]/10"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#111b3f]/40 to-transparent"
          />

          <div className="relative mx-auto grid min-h-[420px] w-full max-w-6xl items-center gap-8 px-6 py-12 sm:min-h-[480px] md:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <div className="max-w-xl">
              <p className="inline-flex w-fit items-center rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                Pragma Radar · Eventos
              </p>

              <h1
                id="eventos-title"
                className="mt-5 text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl lg:text-[60px]"
              >
                Un país también
                <br />
                se conversa.
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/95 sm:text-base">
                Nos reunimos para escuchar otras realidades, compartir
                preguntas y debatir las decisiones que nos afectan.
              </p>
            </div>

            {destacado && (
              <aside
                aria-labelledby="proximo-title"
                className="rounded-[24px] border border-white/30 bg-[#f5f1ff]/95 p-6 text-[#111b3f] sm:p-7"
              >
                <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-[#a68bcf]"
                  />
                  Próximo encuentro
                </p>

                <h2
                  id="proximo-title"
                  className="mt-4 text-xl font-semibold leading-7 tracking-[-0.03em] sm:text-2xl"
                >
                  {destacado.titulo}
                </h2>
                <div className="mt-3"><FavoriteButton tipo="evento" recursoId={destacado.id} /></div>

                <div className="mt-5 space-y-3 border-t border-[#ded5ef] pt-4 text-xs leading-6 text-slate-600">
                  <p className="flex items-start gap-3">
                    <CalendarDays
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 text-[#7863bd]"
                    />

                    <span>
                      {fechaDestacada}
                      {destacado.hora ? ` · ${destacado.hora}` : ""}
                    </span>
                  </p>

                  {(destacado.lugar || destacado.ciudad) && (
                    <p>
                      {[destacado.lugar, destacado.ciudad]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                <a
                  href="#agenda"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#655099] underline decoration-[#c4b4df] underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7863bd]"
                >
                  Consultar la ficha en la agenda
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </a>
              </aside>
            )}
          </div>
        </section>

        {/* AGENDA */}
        <section
          id="agenda"
          aria-labelledby="agenda-title"
          className="w-full max-w-6xl scroll-mt-24 px-6 py-12 md:py-16"
        >
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7863bd]">
                <CalendarDays
                  aria-hidden="true"
                  className="h-4 w-4"
                />
                La agenda
              </p>

              <h2
                id="agenda-title"
                className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
              >
                Un espacio para participar.
              </h2>
            </div>

            <p className="max-w-sm text-xs leading-6 text-slate-600">
              Consulta fechas, lugares y detalles. Cada ficha incluye
              el enlace de inscripción cuando está disponible.
            </p>
          </div>

          {error ? (
            <div
              role="status"
              className="border-l-2 border-[#b5a0e3] bg-[#f5f0fc] px-5 py-6 text-sm leading-6 text-slate-700"
            >
              No pudimos cargar la agenda en este momento. Vuelve a
              intentarlo más tarde.
            </div>
          ) : eventos.length === 0 ? (
            <div
              role="status"
              className="flex items-start gap-4 border-y border-[#e2e9f8] py-8"
            >
              <CalendarDays
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-[#7863bd]"
              />

              <div>
                <h3 className="text-lg font-semibold">
                  Estamos preparando nuevos encuentros.
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Mientras publicamos la agenda, puedes explorar los
                  temas que quieres llevar a la conversación.
                </p>

                <Link
                  href="/articulos"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#5574ff]"
                >
                  Explorar artículos
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </Link>
              </div>
            </div>
          ) : (
            <EventsFilterClient
              eventos={eventos}
              categories={categories}
              hoy={hoy}
            />
          )}
        </section>

        {/* EL SENTIDO DE ENCONTRARNOS */}
        <section
          aria-labelledby="dialogo-title"
          className="relative isolate w-full overflow-hidden bg-[#111b3f] text-white"
        >
          <Image
            src="/pragma-ciudadania.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(17,27,63,0.86) 0%, rgba(17,27,63,0.66) 48%, rgba(17,27,63,0.82) 100%)",
            }}
          />

          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-12 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="max-w-lg">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ddd2ff]">
                El sentido de encontrarnos
              </p>

              <h2
                id="dialogo-title"
                className="mt-4 text-3xl font-semibold leading-[1.12] tracking-[-0.035em] sm:text-4xl"
              >
                Compartimos un país.
                <br />
                <span className="text-[#d5c7ff]">
                  No una sola mirada.
                </span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/95">
                Cada territorio aporta experiencias distintas.
                Encontrarnos permite escucharlas y poner nuestras
                ideas a prueba.
              </p>
            </div>

            <ol className="divide-y divide-white/25">
              {[
                {
                  titulo: "Escuchar otras realidades",
                  texto:
                    "Entender cómo una misma decisión afecta de manera distinta a las personas.",
                  icon: Users,
                  gradient:
                    "from-[#d6e5ff] via-[#aee8ff] to-[#4776ff]",
                },
                {
                  titulo: "Debatir con razones",
                  texto:
                    "Hacer preguntas, contrastar argumentos y revisar la evidencia.",
                  icon: Ear,
                  gradient:
                    "from-[#eee2ff] via-[#c8bcf0] to-[#8c73cf]",
                },
                {
                  titulo: "Construir propuestas",
                  texto:
                    "Reconocer lo que compartimos y trabajar sobre nuestros desacuerdos.",
                  icon: Lightbulb,
                  gradient:
                    "from-[#dfe8ff] via-[#b5d9ff] to-[#7768ff]",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <li
                    key={item.titulo}
                    className="flex items-start gap-4 py-6 first:pt-0 last:pb-0 sm:gap-5"
                  >
                    <div
                      aria-hidden="true"
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient}`}
                    >
                      <Icon
                        className="h-6 w-6 text-white"
                        strokeWidth={1.8}
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-semibold leading-6 tracking-[-0.02em]">
                        {item.titulo}
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-white/95">
                        {item.texto}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* CITA · CIERRE EDITORIAL */}
        <section
          aria-label="Una conversación democrática"
          className="w-full bg-gradient-to-r from-white via-[#f7f5ff] to-[#f2f5ff]"
              >
            <div className="mx-auto flex w-full max-w-6xl justify-end px-6 py-8 md:py-10">
                <figure className="ml-auto max-w-xl border-r-2 border-[#a5b8ff] pr-5 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5574ff]">
                    Una conversación democrática
                  </p>

                  <blockquote className="mt-3 text-sm leading-7 text-slate-600">
                    “Quien conoce solo su propio lado del caso, sabe poco de él.”
                  </blockquote>

                  <figcaption className="mt-2 text-xs leading-6 text-slate-500">
                    <a
                      href="https://www.lifeder.com/john-stuart-mill/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-[#a5b8ff]/60 underline-offset-4 hover:text-[#3458d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5574ff]"
                    >
                      John Stuart Mill
                    </a>
                  </figcaption>
                </figure>
              </div>
        </section>
      </main>

      <footer>
        <Suspense
          fallback={
            <div className="px-8 py-6 text-sm text-slate-500">
              Cargando pie de página…
            </div>
          }
        >
          <Footer />
        </Suspense>
      </footer>
    </div>
  );
}